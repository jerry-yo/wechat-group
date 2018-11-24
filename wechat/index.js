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
			console.log(res, 'wechat  wechatCNFG')
			return res
		}
	}
}

;(async function () {

})()

exports.test = async () => {
	const client = new Wechat(wechatCNFG.wechat)
	const data = await client.fetchAccessToken()

	console.log('------- data in db -------')
	console.log(data)
}
