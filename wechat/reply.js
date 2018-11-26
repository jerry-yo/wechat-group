const {resolve} = require('path')

module.exports = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()

	if (message.MsgType === 'event') {
		let reply
		if (message.Event === 'LOCATION') {
			reply = `您上报位置是：${message.Latitude},${message.Longitude}精度：${message.Precision}`
		}
		ctx.body = reply
	} else if (message.MsgType === 'text') {
		let content = message.Content
		let reply = 'Oh, 你说的' + content + ' 太复杂了，无法理解！！'

		if (content === '1') {

			let tags1 = await client.handle('fetchUserList')
			console.log(tags1)
			reply = JSON.stringify(tags1)

		} else if (content === '2') {
			let userInfo = await client.handle('fetchUserInfo', message.FromUserName)
			console.log(userInfo)
			reply = JSON.stringify(userInfo)
		} else if (content === '3') {
			let arr = [{
				openid: message.FromUserName,
				lang: 'zh_CN'
			}]
			let userInfo = await client.handle('fetchUserInfoList', arr)
			console.log(userInfo)
			reply = JSON.stringify(userInfo)
		} else if (content === '4') {
			let qr = {
				expire_seconds: 604800,
				action_name: 'QR_SCENE',
				action_info: {
					scene: {
						scene_id: 123
					}
				}
			}

			let qrcode = await client.handle('createQrcode', qr)
			console.log(qrcode)
			let mini = client.showQrcode(qrcode.ticket)
			console.log(mini)
			reply = mini
		} else if (content === '5') {
			let url = 'https://coding.imooc.com/class/179.html'
			let mini = await client.handle('longUrlToShortUrl', url)
			console.log(mini)
			reply = mini.short_url
		} else if (content === '6') {
			let data = await client.handle('semanticServer', {
				query: '查一下明天从北京到上海的南航机票',
				city: '北京',
				category: 'flight,hotel',
				uid: message.FromUserName
			})
			console.log(data)
			reply = JSON.stringify(data)
		} else if (content === '7') {
			let data = await client.handle('translatorServer', 'zh_CN', 'en_US', '我真的非常可爱，我喜欢吃橘子。')
			console.log(data)
			reply = JSON.stringify(data)
		} else if (content === '8') {
			let data = await client.handle('uploadMaterial',
				'image',
				resolve(__dirname, '../20181126.jpg'),
				{
					type: 'image'
				}
			)
			// console.log(data)
			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		} else if (content === '9') {
			let picData1 = await client.handle('uploadMaterial',
				'image',
				resolve(__dirname, '../20181126.jpg'),
				{
					type: 'image'
				}
			)
			let picData2 = await client.handle('uploadMaterial',
				'image',
				resolve(__dirname, '../201811261.png'),
				{
					type: 'image'
				}
			)
			console.log(picData2)
			let media = {
				articles: [
					{
						title: '这是永久图文一',
						thumb_media_id: picData1.media_id,
						author: 'yangjing',
						digest: 'baidu',
						show_cover_pic: 1,
						content: '百度云',
						content_source_url: 'https://www.baidu.com'
						// need_open_comment:1,
						// only_fans_can_comment:1
					}, {
						title: '这是永久图文二',
						thumb_media_id: picData2.media_id,
						author: 'yangjing',
						digest: 'github',
						show_cover_pic: 1,
						content: 'github',
						content_source_url: 'https://github.com/'
					}
				]
			}
			let uploadData = await client.handle('uploadMaterial',
			'news', media, {})

			// let res = await client.handle('fetchMaterial', '')
			console.log(uploadData)
			reply = '上传成功'
		} else if (content = '10') {
			let counts = await client.handle('countMaterial')

			console.log(JSON.stringify(counts))

			let res = await Promise.all([
				client.handle('batchMaterial', {
					type: 'image',
					offset: 0,
					count: 10
				}),
				client.handle('batchMaterial', {
					type: 'video',
					offset: 0,
					count: 10
				}),
				client.handle('batchMaterial', {
					type: 'voice',
					offset: 0,
					count: 10
				}),
				client.handle('batchMaterial', {
					type: 'news',
					offset: 0,
					count: 10
				})
			])
			console.log(res)
			reply = `
			image: ${res[0].total_count}
			video: ${res[1].total_count}
			voice: ${res[2].total_count}
			news: ${res[3].total_count}
			`
		}
		ctx.body = reply
	}

	await next()
}
