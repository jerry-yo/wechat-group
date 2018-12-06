const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const _ = require('lodash')
const Category = mongoose.model('Category')

// 0. 电影分类model 创建
// 1. 电影分类的录入页面
exports.show = async (ctx, next) => {
  let {_id} = ctx.params
  console.log('_id:', ctx.params)
  let movie = {}
  if (_id) {
    movie = await Movie.findOne({_id})
  }
  let categories = await Category.find({})
  await ctx.render('pages/movie_admin', {
    title: '后台分类录入页面',
    movie,
    categories
  })
}
// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  let movieData = ctx.request.body || {}
  let movie

  if (movieData._id) {
    movie = await Movie.findOne({_id: movieData._id})
  }
  const categoryId = movieData.categoryId
  const categoryName = movieData.categoryName
  let category

  if (categoryId) {
    category = await Category.findOne({_id: categoryId})
  } else if (categoryName){
    category = new Category({name: categoryName})
    await category.save()
  }

  if (movie) {
    movie = _.extend(movie, movieData)
    movie.category = category._id
  } else {
    delete movieData._id
    movieData.category = category._id
    movie = new Movie(movieData)
  }

  category = await Category.findOne({_id: category._id})

  if (category) {
    category.movies = category.movies || []
    category.movies.push(movie._id)

    await category.save()
  }

  await movie.save()
  ctx.redirect('/admin/movie/list')
}
// 3. 电影分类的后台列表

exports.list = async (ctx, next) => {
  const movies = await Movie.find({}).populate('category', 'name')
  console.log(movies)
  await ctx.render('pages/movie_list', {
    title: '标签列表',
    movies
  })
}

exports.del = async (ctx, next) => {
  const id = ctx.query.id
  let movie
  if (id) {
    movie = await Movie.findOne({_id: id})
  }

  if (!movie) {
    return (ctx.body = {
      success: false
    })
  }

  try {
    await Movie.remove({_id: id})
    ctx.body = {success: true}
  } catch (err) {
    ctx.body = {success: false}
  }
}
// 4. 对应的分类的路由规则
// 5. 对应的分类页面
