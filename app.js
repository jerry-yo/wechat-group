const Koa = require('koa')
const {resolve} = require('path')
const moment = require('moment')
const config = require('./config/config')
const {initSchema, connect} = require('./app/database/init')

;(async () => {
  await connect(config.db)

  initSchema()
  // 测试token存储
  const app = new Koa()
  const views = require('koa-views')

  app.use(views(resolve(__dirname + '/app/views'), {
    extension: 'pug',
    options: {
      moment: moment
    }
  }))

  const router = require('./config/routes')
  app.use(router.routes())

  app.listen(config.port, () => {
    console.log(`listening on port ${config.baseUrl}`)
  })
})()
