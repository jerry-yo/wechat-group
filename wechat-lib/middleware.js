const sha1 = require('sha1')
const getRawBody = require('raw-body')
const contentType = require('content-type')
const util = require('./util')

module.exports = (opts, reply) => {
	return async (ctx, next) => {
		const {signature, timestamp, nonce, echostr} = ctx.query
		const token = opts.token
		let str = [token, timestamp, nonce].sort().join('')

		const sha = sha1(str)

		if (ctx.method === 'GET') {
			if (sha === signature) {
				ctx.body = echostr
			}else {
				ctx.body = 'Failed'
			}
		} else if (ctx.method === 'POST') {
			if (sha !== signature) {
				return (ctx.body = 'Failed')
			}
			// 获取
			const data = await getRawBody(ctx.req, {
				length: ctx.request.header['content-length'],
				limit: '1mb',
				encoding: contentType.parse(ctx.request).parameters.charset
			})

			// 解析xml信息
			const content = await util.parseXML(data)
			const message = util.formatMessage(content.xml)

			ctx.weixin = message
			console.log('weixin', message)
			await reply.apply(ctx, [ctx, next])

			const replyBody = ctx.body
			const msg = ctx.weixin
			const xml = util.tpl(replyBody, msg)

			console.log(xml)
			ctx.status = 200
			ctx.type = 'application/xml'
			ctx.body = xml

		} 
	}
}