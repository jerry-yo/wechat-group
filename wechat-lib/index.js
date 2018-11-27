const fs = require('fs')
const request = require('request-promise')

const base = 'https://api.weixin.qq.com/cgi-bin/'
const ticketBase = 'https://mp.weixin.qq.com/cgi-bin/'
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'

const api = {
	accessToken: base +  'token?grant_type=client_credential',
	temporary: {
		upload: base + 'media/upload?'
	},
	permanent: {
		upload: base + 'material/add_material?',
		uploadNews: base + 'material/add_news?',
		uploadNewsPic: base + 'media/uploadimg?',
		fetch: base + 'material/get_material?',
		del: base + 'material/del_material?',
		update: base + 'material/update_news?',
		count: base + 'material/get_materialcount?',
		batch: base + 'material/batchget_material?'
	},
	tags: {
		create: base + 'tags/create?',
		fetch: base + 'tags/get?',
		update: base + 'tags/update?',
		delete: base + 'tags/delete?',
		fetchTagUsers: base + 'user/tag/get?',
		batchTags: base + 'tags/members/batchtagging?',
		batchUnTags: base + 'tags/members/batchuntagging?',
		fetchUserTags: base + 'tags/getidlist?'
	},
	user: {
		fetchUserList: base + 'user/get?',
		remark: base + 'user/info/updateremark?',
		fetchUserInfo: base + 'user/info?',
		fetchUsersInfo: base + 'user/info/batchget?'
	},
	qrcode: {
		create: base + 'qrcode/create?',
		show: ticketBase + 'showqrcode?'
	},
	shortUrl: {
		toShortUrl: base + 'shorturl?'
	},
	AI: {
		translator: base + 'media/voice/translatecontent?'
	},
	menu: {
		create: base + 'menu/create?',
		fetch: base + 'menu/get?',
		delete: base + 'menu/delete?',
		addConditional: base + 'menu/addconditional?',
		delConditional: base + 'menu/delconditional?',
		matchConditional: base + 'menu/trymatch?',
		getCurrentMenu: base + 'get_current_selfmenu_info?'
	}
}

module.exports = class Wechat {
	constructor (opts) {
		this.opts = Object.assign({}, opts)
		this.appID = opts.appID
		this.appSecret = opts.appSecret
		this.getAccessToken = opts.getAccessToken
		this.saveAccessToken = opts.saveAccessToken
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

		// 获取保存的AccessToken
		let data = await this.getAccessToken()

		// 验证AccessToken是否过期
		if (!this.isValidToken(data)) {
			data = await this.updateAccessToken()
		}

		// 保存AccessToken
		await this.saveAccessToken(data)
		return data
	}

	async updateAccessToken () {
		const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

		const data = await this.request({url})
		const now  = new Date().getTime()
		const expires_in = now + (data.expires_in - 20) * 1000

		data.expires_in = expires_in
		return data
	}

	isValidToken (data) {
		if (!data || !data.expires_in) {
			return false
		}

		const expiresIn = data.expires_in
		const nowTime = new Date().getTime()

		if (expiresIn > nowTime) {
			return true
		} else {
			return false
		}
	}

	uploadMaterial (token, type, material, permanent = false) {
		let form  = {}
		let url = api.temporary.upload
		// 永久素材 form 是个 OBJ 继承外面传入的新的对象
		if (permanent) {
			url = api.permanent.upload

			form  = Object.assign(form, permanent)
		}

		//上传图文消息的图片素材
		if (type === 'pic') {
			url = api.permanent.uploadNewsPic
		}
		// 图文 非图文的素材提交表单的切换
		if (type === 'news') {
			url = api.permanent.uploadNews
			form = material
		} else {
			form.media = fs.createReadStream(material)
		}

		let uploadUrl = `${url}access_token=${token}`
		// 根据素材永久性填充  token   如果是个form表单是需要把token 传进去的
		if (!permanent) {
			uploadUrl += `&type=${type}`
		} else {
			if (type !== 'news') {
				form.access_token = token
			}
			if (type !== 'news' && type !== 'pic') {
				uploadUrl += `&type=${type}`
			}
		}

		const options = {
			method: 'POST',
			url: uploadUrl,
			json: true
		}

		// 图文 非图文 在request 提交主体判断
		if (type === 'news') {
			options.body = form
		} else {
			options.formData = form
		}
		return options
	}

	// 封装用来请求接口的入口方法
  async handle (operation, ...args) {
    const tokenData = await this.fetchAccessToken()
    const options = this[operation](tokenData.access_token, ...args)
		const data = await this.request(options)

    return data
  }

	fetchMaterial (token, mediaId, type, permanent) {
		let form = {
			media_id: mediaId
		}
		let url = `${api.permanent.fetch}access_token=${token}`

		return {
			method: 'POST',
			url,
			body: form
		}
	}

	delMaterial (token, mediaId) {
		let form = {
			media_id: mediaId
		}
		let delUrl = api.permanent.del
		let url = `${delUrl}access_token=${token}`

		return {
			method: 'POST',
			url,
			body: form
		}
	}

	updateMaterial (token, mediaId, news) {
		let form = {
			media_id: mediaId
		}
		form = Object.assign(form, news)

		let url = `${api.permanent.update}access_token=${token}`

		return {
			method: 'POST',
			url,
			body: form
		}
	}

	countMaterial (token) {
		let url = `${api.permanent.count}access_token=${token}`

		return {
			method: 'POST',
			url
		}
	}

	batchMaterial (token, options) {
		options.type = options.type || 'image'
		options.offset = options.offset || 0
		options.count = options.count || 10

		let url = `${api.permanent.batch}access_token=${token}`

		return {
			method: 'POST',
			url,
			body: options
		}
	}

	createTag (token, name) {
		let body = {
			tag: {
				name
			}
		}
		let url = `${api.tags.create}access_token=${token}`

		return {method: 'POST', url, body}
	}

	fetchTags (token) {
		let url = `${api.tags.fetch}access_token=${token}`

		return {url}
	}

	updateTag (token, id, name) {
		let body = {
			tag: {
				id,
				name
			}
		}
		let url = `${api.tags.update}access_token=${token}`

		return {method: 'POST', url, body}
	}

	deleteTag (token, id) {
		let body = {
			tag: {
				id
			}
		}
		let url = `${api.tags.delete}access_token=${token}`

		return {method: 'POST', url, body}
	}

	fetchTagUsers (token, id, openId) {
		let body = {
			tagid: id,
			next_openid: openId || ''
		}
		let url = `${api.tags.fetchUsers}access_token=${token}`
		return {method: 'POST', url, body}
	}

	batchTags (token, openIdList, tagId, unTag = false) {
		let body = {
			openid_list: openIdList,
			tagid: tagId
		}
		let url = unTag ? `${api.tags.batchUnTags}access_token=${token}` : `${api.tags.batchTags}access_token=${token}`

		return {method: 'POST', url, body}
	}

	fetchUserTags (token, openId) {
		let body = {
			openid: openId
		}
		let url = `${api.tags.fetchUserTags}access_token=${token}`

		return {method: 'POST', url, body}
	}

	remarkUser (token, openId, remark) {
		let body = {
			openid: openId,
			remark
		}
		let url = `${api.user.remark}access_token=${token}`

		return {method: 'POST', url, body}
	}

	fetchUserList (token, openId) {
		let next_openid = openId || ''
		let url = `${api.user.fetchUserList}access_token=${token}&next_openid=${next_openid}`

		return {url}
	}

	fetchUserInfo (token, openId) {
		let url = `${api.user.fetchUserInfo}access_token=${token}&openid=${openId}&lang=zh_CN`

		return {url}
	}

	fetchUserInfoList (token, userList) {
		let body = {
			user_list: userList
		}
		let url = `${api.user.fetchUsersInfo}access_token=${token}`

		return {method: 'POST', url, body}
	}

	createQrcode (token, qr) {
		const url = `${api.qrcode.create}access_token=${token}`
		const body = qr

		return {method: 'POST', url, body}
	}

	showQrcode (ticket) {
		let ticketEnCode = encodeURI(ticket)
		let url = `${api.qrcode.show}ticket=${ticketEnCode}`

		return url
	}

	longUrlToShortUrl (token, longUrl) {
		let body = {
			action: 'long2short',
			long_url: longUrl
		}
		let url = `${api.shortUrl.toShortUrl}access_token=${token}`

		return {method: 'POST', url, body}
	}

	semanticServer (token, semantic) {
		let body = semantic
		body.appid = this.appID
		let url = `${semanticUrl}access_token=${token}`

		return {method: 'POST', url, body}
	}

	translatorServer (token, lfrom, lto, body) {
		let url = `${api.AI.translator}access_token=${token}&lfrom=${lfrom}&lto=${lto}`

		return {method: 'POST', url, body}
	}

	createMenu (token, options) {
		let url = `${api.menu.create}access_token=${token}`

		return {method: 'POST', url, body: options}
	}

	fetchMenu (token) {
		let url = `${api.menu.fetch}access_token=${token}`

		return {url}
	}

	deleteMenu (token) {
		let url = `${api.menu.delete}access_token=${token}`

		return {url}
	}

	addConditional (token, options) {
		let url = `${api.menu.addConditional}access_token=${token}`

		return {method: 'POST', url, body: options}
	}

	delConditional (token, menuid) {
		let body = {
			menuid
		}
		let url = `${api.menu.addConditional}access_token=${token}`

		return {method: 'POST', url, body}
	}

	matchConditional (token, userId) {
		let body = {
			user_id: userId
		}
		let url = `${api.menu.matchConditional}access_token=${token}`

		return {method: 'POST', url, body}
	}

	getCurrentMenu (token) {
		let url = `${api.menu.getCurrentMenu}access_token=${token}`

		return {url}
	}
}
