const Wechat = require('../app/controllers/wechat')
const User = require('../app/controllers/user')
const Index = require('../app/controllers/index')
const Category = require('../app/controllers/category')
const Movie = require('../app/controllers/movie')
const Comment = require('../app/controllers/comment')
const KoaBody = require('koa-body')
const router = require('koa-router')()

// 微信页面授权
router.get('/jssdk', Wechat.jssdk)
// 微信消息中间件
router.get('/wx-hear', Wechat.hear)
router.post('/wx-hear', Wechat.hear)
// 跳到授权的微信页面
router.get('/wx-oauth', Wechat.oauth)
// 通过code 获取用户信息
router.get('/userinfo', Wechat.userinfo)

// index
router.get('/', Index.homePage)
// 电影详情页
router.get('/movie/:_id', Movie.detail)
// 电影搜索
router.get('/results', Movie.search)
// 评论
router.post('/comment', User.signRequired, Comment.save)

// 用户的注册登录路由
router.get('/user/signin', User.showSignin)
router.get('/user/signup', User.showSignup)
router.post('/user/signin', User.signin)
router.post('/user/signup', User.signup)
router.get('/logout', User.logout)

// 用户列表管理
router.get('/admin/user/list', User.signRequired, User.adminRequired, User.list)
router.delete('/admin/user', User.signRequired, User.adminRequired, User.del)
// 后台的分类管理页面
router.post('/admin/category', User.signRequired, User.adminRequired, Category.new)
router.get('/admin/category', User.signRequired, User.adminRequired, Category.show)
router.delete('/admin/category', User.signRequired, User.adminRequired, Category.del)
router.get('/admin/category/list', User.signRequired, User.adminRequired, Category.list)
router.get('/admin/category/update/:_id', User.signRequired, User.adminRequired, Category.show)

// 后台的电影管理页面
router.post('/admin/movie', User.signRequired, User.adminRequired, KoaBody({multipart: true, multiples: false}), Movie.savePoster, Movie.new)
router.get('/admin/movie', User.signRequired, User.adminRequired, Movie.show)
router.delete('/admin/movie', User.signRequired, User.adminRequired, Movie.del)
router.get('/admin/movie/list', User.signRequired, User.adminRequired, Movie.list)
router.get('/admin/movie/update/:_id', User.signRequired, User.adminRequired, Movie.show)

module.exports = router
