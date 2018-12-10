const Koa = require('koa')
const {resolve} = require('path')
const moment = require('moment')
const mongoose = require('mongoose')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const config = require('./config/config')
const {initSchema, connect} = require('./app/database/init')

;(async () => {
  await connect(config.db)

  initSchema()
  // 测试token存储
  const app = new Koa()
  const views = require('koa-views')

  app.use(views(resolve(__dirname, 'app/views'), {
    extension: 'pug',
    options: {
      moment: moment
    }
  }))
  app.keys = ['wechat_movie']
  app.use(session(app))
  app.use(bodyParser())
  app.use(serve(resolve(__dirname, './public')))
  // 植入两个中间件， 做前置的微信环境检查，跳转，回调的用户数据存储和状态同步
  const wechatController = require('./app/controllers/wechat')
  app.use(wechatController.checkWechat)
  app.use(wechatController.wechatRedirect)

  app.use(async (ctx, next) => {
    const User = mongoose.model('User')
    let user = ctx.session.user

    if (user && user._id) {
      user = await User.findOne({_id: user._id})
      ctx.session.user = {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
      }
      ctx.state = Object.assign(ctx.state, {
        user: {
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        }
      })
    } else {
      ctx.session.user = null
    }

    await next()
  })
  const router = require('./config/routes')
  app.use(router.routes())

  app.listen(config.port, () => {
    console.log(`listening on port ${config.baseUrl}`)
  })
})()
