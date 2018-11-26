const config = require('../config/config')
const Wechat = require('../wechat-lib')
const mongoose = require('mongoose')

const Token = mongoose.model('Token')

const wechatCNFG = {
	wechat: {
		appID: config.wechat.appID,
		appSecret: config.wechat.appSecret,
		token: config.wechat.token,
		getAccessToken: async () => {
			const res = await Token.getAccessToken()

			return res
		},
		saveAccessToken: async (data) => {
			const res = await Token.saveAccessToken(data)
			return res
		}
	}
}

exports.getWechat = () => new Wechat(wechatCNFG.wechat)
