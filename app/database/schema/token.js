// schema
// model
// entity

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TokenSchema = new Schema({
  name: String,
  token: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

TokenSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TokenSchema.statics = {
  async getAccessToken () {
    const token = await this.findOne({
      name: 'access_token'
    })
    if (token && token.token) {
      token.access_token = token.token
      console.log(token, 'get')
    }

    return token
  },
  async saveAccessToken (data) {
    let token = await this.findOne({
      name: 'access_token'
    })

    if (token) {
      token.token = data.access_token
      token.expires_in = data.expires_in
    } else {
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }
    await token.save()

    return token
  }
}

const Token = mongoose.model('Token', TokenSchema)
