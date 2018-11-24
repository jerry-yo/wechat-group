const Koa = require('koa')
const wechat= require('./wechat-lib/middleware')
const config = require('./config/config')
const reply = require('./wechat/reply')
const {initSchema, connect} = require('./app/database/init')

;(async () => {
  await connect(config.db)

  initSchema()
  // 测试token存储
  const {test} = require('./wechat/index')
  await test()

  const app = new Koa()

  //加载认证的中间件
  //ctx 是 koa 的应用上下文
  //next 就是串联中间件的钩子函数
  app.use(wechat(config.wechat, reply))

  app.listen(config.port)

  console.log('listen:' + config.port)
})()
