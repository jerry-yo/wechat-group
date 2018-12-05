const mongoose = require('mongoose')
const Catepory = mongoose.model('Catepory')

// 0. 电影分类model 创建
// 1. 电影分类的录入页面
exports.show = async (ctx, next) => {
  let {id} = ctx.params
  console.log(ctx.params)
  let catepory = {}
  if (id) {
    catepory = await Catepory.findOne({_id: id})
  }
  await ctx.render('pages/catepory_admin', {
    title: '后台分类录入页面',
    catepory
  })
}
// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  const { name, _id } = ctx.request.body.catepory
  let catepory

  if (_id) {
    catepory = await Catepory.findOne({_id})
  }

  if (catepory) {
    catepory.name = name
  } else {
    catepory = new Catepory({ name })
  }

  await catepory.save()
  ctx.redirect('/admin/catepory/list')
}
// 3. 电影分类的后台列表

exports.list = async (ctx, next) => {
  const categories = await Catepory.find({})
  console.log(categories)
  await ctx.render('pages/catepory_list', {
    title: '标签列表',
    categories
  })
}
// 4. 对应的分类的路由规则
// 5. 对应的分类页面
