const Koa = require('koa')
const config = require('./config/config')
const {initSchema, connect} = require('./app/database/init')

;(async () => {
  await connect(config.db)

  initSchema()
  // 测试token存储
  const app = new Koa()


  const router = require('./config/routes')
  app.use(router.routes())

  app.listen(config.port, () => {
    console.log(`listening on port ${config.port}`)
  })
})()
