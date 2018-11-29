// 1. 用户访问 网页 /a
// 2.二跳网页地址 /b? appidredirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
// 3.a ? code
// 4. code  => wechat url => access_token
// 5. access_token =>openid/unionid
const request = require('request-promise')

const base = 'https://api.weixin.qq.com/'
const open = 'https://open.weixin.qq.com/'
const api = {
  authorize: open + 'connect/oauth2/authorize?',
  accessToken: base + 'sns/oauth2/access_token?',
  userInfo: base + 'sns/userinfo?'
}

module.exports = class wechatOAuth {
  constructor (opts) {
		this.appID = opts.appID
		this.appSecret = opts.appSecret
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

  getAuthorizeURL (scope = 'snsapi_base', target, state) {
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`

    return url
  }

  async fetchAccessToken (code) {
    const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`
    console.log('----' + url)
    const res = await this.request({url})
    console.log('------' + JSON.stringify(res))
    return res
  }

  async getUserInfo (token, openID, lang = 'zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    const res = await this.request({url})

    return res
  }
}
