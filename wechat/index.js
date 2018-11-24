const config = require('../config/config')
const Wechat = require('../wechat-lib')

const wechatCNFG = {
	wechat: {
		appID: config.wechat.appID,
		appSecret: config.wechat.appSecret,
		token: config.wechat.token
	}
}

;(async function () {
	const client = new Wechat(wechatCNFG.wechat)
})()