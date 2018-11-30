const reply = require('../../wechat/reply')
const config = require('../../config/config')
const {getOAuth, getWechat} = require('../../wechat')
const api = require('../api/index')
const wechatMiddle = require('../../wechat-lib/middleware')

//加载认证的中间件
//ctx 是 koa 的应用上下文
//next 就是串联中间件的钩子函数
// 接入微信消息中间件
exports.hear = async (ctx, next) => {
  const middle = wechatMiddle(config.wechat, reply)

  await middle(ctx, next)
}

exports.oauth = async (ctx, next) => {
  const target = config.baseUrl + 'userinfo'
  const scope = 'snsapi_userinfo'
  const state = ctx.query.id
  const url = api.wechat.getAuthorizeURL(scope, target, state)
  ctx.redirect(url)
}

exports.userinfo = async (ctx, next) => {
  const oauth = getOAuth()
  const code = ctx.query.code
  const tokenData = await oauth.fetchAccessToken(code)
  const userData = await oauth.getUserInfo(tokenData.access_token, tokenData.openid)

  ctx.body = userData
}

exports.jssdk = async (ctx, next) => {
  const url = ctx.href
  const params = await api.wechat.getSignature(url)
  await ctx.render('wechat/sdk', params)
}
