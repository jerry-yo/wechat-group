const xml2js = require('xml2js')
const template = require('./tpl')
const sha1 = require('sha1')

exports.parseXML = xml => {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xml, {trim: true}, (err, content) => {
			if (err) reject(err)
			else resolve(content)
		})
	})
}

const formatMessage = result => {
	let message = {}

	if (typeof result === 'object') {
		const keys = Object.keys(result)

		for (let i = 0; i < keys.length; i++) {
			let item  = result[keys[i]]
			let key = keys[i]

			if (!(item instanceof Array) || item.length === 0) {
				continue
			}

			if (item.length === 1) {
				let val  = item[0]

				if (typeof val === 'object') {
					message[key] = formatMessage(val)
				} else {
					message[key] = (val || '').trim()
				}
			} else {
				message[key] = []

				for (let i = 0; j < item.length; j++) {
					message[key].push(formatMessage(item[j]))
				}
			}
		}
	}

	return message
}

exports.formatMessage = formatMessage

const tpl = (content, message) => {
	let type = 'text'

	if (Array.isArray(content)) {
		type = 'news'
	}

	if (!content) content = 'Empty News'
	if (content && content.type) {
		type = content.type
	}

	let info = Object.assign({}, {
		content: content,
		msgType: type,
		createTime: new Date().getTime(),
		toUserName: message.FromUserName,
		fromUserName: message.ToUserName
	})

	return template(info)
}
exports.tpl = tpl

const createNonce = () => {
	return Math.random().toString(36).substr(2, 16)
}

const createTimestamep = () => {
	return parseInt(new Date().getTime() / 1000, 10) + ''
}

const signIt = (params) => {
	let keys = Object.keys(params)
	let newArgs = {}
	let str = ''
	keys = keys.sort()
	keys.forEach(key => {
		newArgs[key.toLowerCase()] = params[key]
	})
	for (let k in newArgs) {
		str += '&' + k + '=' + newArgs[k]
 	}
	return str.substr(1)
}
const shaIt = (noncestr, ticket, timestamp, url) => {
	let ret = {
		jsapi_ticket: ticket,
		noncestr: noncestr,
		timestamp: timestamp,
		url
	}

	const str = signIt(ret)
	const sha = sha1(str)

	return sha
}
const sign = (ticket, url) => {
	const noncestr = createNonce()
	const timestamp = createTimestamep()
	const signature = shaIt(noncestr, ticket, timestamp, url)
	return {
		noncestr,
		timestamp,
		signature
	}
}
exports.sign = sign
