const mongoose = require('mongoose')
const Category = mongoose.model('Category')

// 0. 电影分类model 创建
// 1. 电影分类的录入页面
exports.show = async (ctx, next) => {
  let {_id} = ctx.params
  let category = {}
  if (_id) {
    category = await Category.findOne({_id})
  }
  await ctx.render('pages/category_admin', {
    title: '后台分类录入页面',
    category
  })
}
// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  const { name, _id } = ctx.request.body.category
  let category

  if (_id) {
    category = await Category.findOne({_id})
  }

  if (category) {
    category.name = name
  } else {
    category = new Category({ name })
  }

  await category.save()
  ctx.redirect('/admin/category/list')
}
// 3. 电影分类的后台列表

exports.list = async (ctx, next) => {
  const categories = await Category.find({})
  console.log(categories)
  await ctx.render('pages/category_list', {
    title: '标签列表',
    categories
  })
}
exports.del = async (ctx, next) => {
  const id = ctx.query.id
  let category
  if (id) {
    category = await Category.findOne({_id: id})
  }

  if (!category) {
    return (ctx.body = {
      success: false
    })
  }

  try {
    await Category.remove({_id: id})
    ctx.body = {success: true}
  } catch (err) {
    ctx.body = {success: false}
  }
}
// 4. 对应的分类的路由规则
// 5. 对应的分类页面
