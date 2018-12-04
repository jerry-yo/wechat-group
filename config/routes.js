const Wechat = require('../app/controllers/wechat')
const User = require('../app/controllers/user')
const Index = require('../app/controllers/index')

const router = require('koa-router')()

// index
router.get('/', Index.homePage)

// 微信页面授权
router.get('/jssdk', Wechat.jssdk)

// 微信消息中间件
router.get('/wx-hear', Wechat.hear)
router.post('/wx-hear', Wechat.hear)

// 跳到授权的微信页面
router.get('/wx-oauth', Wechat.oauth)
// 通过code 获取用户信息
router.get('/userinfo', Wechat.userinfo)
// 用户的注册登录路由
router.get('/user/signin', User.showSignin)
router.get('/user/signup', User.showSignup)
router.post('/user/signin', User.signin)
router.post('/user/signup', User.signup)
router.get('/logout', User.logout)


module.exports = router
