const mongoose = require('mongoose')
const {resolve} = require('path')
const glob = require('glob')

const options = {
  useNewUrlParser: true
}

mongoose.Promise = global.Promise

exports.initSchema = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js'))
  .forEach(require)
}

exports.connect = (db) => {
  return new Promise((resolve, reject) => {
    mongoose.set('debug', true)
    mongoose.connect(db, options)

    mongoose.connection.on('disconnect', () => {
      console.log('数据库挂了')
    })

    mongoose.connection.on('error', err => {
      console.log(err)
    })

    mongoose.connection.on('open', () => {
      resolve()
      console.log('================== ')
      console.log('================== ')
      console.log('    数据库连接成功   ')
      console.log('================== ')
      console.log('================== ')
    })
  })
}
