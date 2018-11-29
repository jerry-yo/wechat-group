const Wechat = require('../app/controllers/wechat')

const router = require('koa-router')()

router.get('/wx-hear', Wechat.hear)
router.post('/wx-hear', Wechat.hear)

// 跳到授权的微信页面
router.get('/wx-oauth', Wechat.oauth)
// 通过code 获取用户信息
router.get('/userinfo', Wechat.userinfo)

module.exports = router
