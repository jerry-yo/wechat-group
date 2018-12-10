const {getOAuth, getWechat} = require('../../wechat/index')
const util = require('../../wechat-lib/util')
const mongoose = require('mongoose')
const User = mongoose.model('User')

exports.getSignature = async (url) => {
  const client = getWechat()
  const data = await client.fetchAccessToken()
  const token = data.access_token
  const ticketData = await client.fetchTicket(token)
  const ticket = ticketData.ticket

  let params = util.sign(ticket, url)

  return Object.assign(params, {
    appId: client.appID
  })
}


exports.getAuthorizeURL = async (scope, target, state) => {
  const oauth = getOAuth()
  const url = oauth.getAuthorizeURL(scope, target, state)
  return url
}

exports.getUserinfoByCode = async (code) => {
  const oauth = getOAuth()
  const tokenData = await oauth.fetchAccessToken(code)
  const userData = await oauth.getUserInfo(tokenData.access_token, tokenData.openid)

  return userData
}

exports.getUserByOpenid = async (id) => {
  const user = User.findOne({
    openid: {
      $in: [id]
    }
  })
  return user
}

exports.saveWechatUser = async (userData) => {
  let query = {
    openid: userData.openid
  }

  if (userData.unionid) {
    query = {
      unionid: userData.unionid
    }
  }

  let user = await User.findOne(query)

  if (!user) {
    user = new User({
      openid: [userData.openid],
      unionid: userData.unionid,
      nickname: userData.nickname,
      email: (userData.unionid || userData.openid) + '@wx.com',
      province: userData.province,
      country: userData.country,
      city: userData.city,
      gender: userData.gender || userData.sex
    })

    user = await user.save()
  }
  return user
}