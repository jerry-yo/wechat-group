const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// 加密权重
const SALT_WORK_FACTOR = 10
// 登录的最大失败尝试次数
const MAX_LOGIN_ATTEMPTS = 5
// 登录失败锁定时间
const LOCK_TIME = 2 * 60 * 60 * 1000

const Schema = mongoose.Schema

const UserSchema = new Schema({
  // user admin superAdmin
  role: {
    type: String,
    default: 'user'
  },
  // 兼容各个微信应用，小程序或者公众号的微信用户 ID
  openid: [String],
  unionid: String,
  // 来自哪个渠道关注的
  from: String,
  nickname: String,
  address: String,
  province: String,
  country: String,
  city: String,
  gender: String,
  email: {
    unique: true,
    type: String
  },
  password: String,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lock_until && this.lock_until > Date.now())
})

// 中间件
UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

// 中间件
UserSchema.pre('save', function (next) {
  let self = this

  if (!self.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(self.password, salt, (err, hash) => {
      if (err) return next(err)

      self.password = hash
      next()
    })
  })
})
// 静态方法
UserSchema.methods = {
  comparePassword: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    })
  },
  incLoginAttempts: function (user) {
    const self = this
    return new Promise((resolve, reject) => {
      if (self.lock_until && self.lock_until < Date.now()) {
        self.update({
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lock_until: 1
          }
        }, function (err) {
          if (!err) resolve(true)
          else reject(err)
        })
      } else {
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        }
        if (self.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS || !self.isLocked) {
          updates.$set = {
            lock_until: Date.now() + LOCK_TIME
          }
        }
        self.update(updates, err => {
          if (!err) resolve(true)
          else reject(err)
        })
      }
    })
  }
}

const User = mongoose.model('User', UserSchema)
