const request = require('request-promise')

const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
	accessToken: base +  'token?grant_type=client_credential'
}

module.exports = class Wechat {
	constructor (opts) {
		this.opts = Object.assign({}, opts)
		this.appID = opts.appID
		this.appSecret = opts.appSecret

		this.fetchAccessToken()
	}


	async request (options) {
		options = Object.assign({}, options, {json: true})

		try {
			const res = await request(options)

			return res
		} catch (err) {
			console.log(err)
		}
	}

	async fetchAccessToken () {
		let data
		if (this.getAccessToken) {
			data = await this.getAccessToken()
		}
		
		if (!this.isValidToken(data)) {
			data = await this.updateAccessToken()
		}
	}

	async updateAccessToken () {
		const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

		const data = await this.request({url})
		console.log(data)
		const now  = new Date().getTime()
		const expires_in = now + (data.expires_in - 20) * 1000

		data.expires_in = expires_in
		console.log(data)
		return data
	}

	isValidToken (data) {
		if (!data || !data.expires_in) {
			return false
		}

		const expiresIn = data.expires_in
		const nowTime = new Date().getTime()

		if (expiresIn > now) {
			return true 
		} else {
			return false
		}
	}
}