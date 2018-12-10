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
  const userData = await api.wechat.getUserinfoByCode(ctx.query.code)
  ctx.body = userData
}

exports.jssdk = async (ctx, next) => {
  const url = ctx.href
  const params = await api.wechat.getSignature(url)
  await ctx.render('wechat/sdk', params)
}

function isWechat (ua) {
  if (ua.indexOf('MicroMessenger') >= 0) {
    return true 
  } else {
    return false
  }
}

exports.checkWechat = async (ctx, next) => {
  if (ctx.request.url === '/favicon.ico') {
    return
  }
  const ua  = ctx.headers['user-agent']
  const code = ctx.query.code
  // 所有的网页请求都会流经这个中间件，包括微信的网页访问
  // 针对POST非GET请求，不走用户授权流程
  if (ctx.method === 'GET') {
    // 如果参数带Code， 说明已经授权
    if (code || ctx.session.user) {
      await next()
      // 如果没有code ，且来自微信访问，就可以配置授权的跳转
    } else if (isWechat(ua)) {
      const target = ctx.href
      const scope = 'snsapi_userinfo'
      const url = await api.wechat.getAuthorizeURL(scope, target, 'fromWechat')
      ctx.redirect(url)
      await next()
    } else {
      await next()
    }
  } else {
    await next()
  }
}

exports.wechatRedirect = async (ctx, next) => {
  const {code, state} = ctx.query

  if (code && state === 'fromWechat') {
    const userData = await api.wechat.getUserinfoByCode(code)
    // if (userData.openid) {
    let user = await api.wechat.getUserByOpenid(userData.openid)
    if (!user) {
      user = await api.wechat.saveWechatUser(userData)
    }
    ctx.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }

    ctx.state = Object.assign(ctx.state, {
      user: {
        _id: user._id,
        nickname: user.nickname
      }
    })
    ctx.redirect(config.baseUrl)
  }
  await next()
}

exports.getSDKSignature = async (ctx, next) => {
  let url = ctx.query.url

  url = decodeURIComponent(url)

  const params = await api.wechat.getSignature(url)

  ctx.body = {
    success: true,
    data: params
  }
}