const {resolve} = require('path')

module.exports = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()

	if (message.MsgType === 'text') {
		let content = message.Content
		let reply = 'Oh, 你说的' + content + ' 太复杂了，无法理解！！'

		if (content === '1') {
			await client.handle('createTag', 'VUEFROM')
			let tags1 = await client.handle('fetchTags')
			console.log(tags1)
			reply = JSON.stringify(tags1)

		} else if (content === '2') {
			let tags = await client.handle('updateTag', 101, 'VUESSR')
			console.log(tags)
			let tags2 = await client.handle('fetchTags')
			console.log(tags2)
			reply = JSON.stringify(tags2)
		} else if (content === '3') {
			let tags = await client.handle('fetchUsers', 101, '')
			console.log(tags)
			reply = JSON.stringify(tags)
		} else if (content === '4') {
			await client.handle('batchTags', [message.FromUserName], 101)
			await client.handle('batchTags', [message.FromUserName], 102)
			await client.handle('batchTags', [message.FromUserName], 103)
			let tag = await client.handle('fetchUserTags', message.FromUserName)
			console.log(tag)
			reply = JSON.stringify(tag)
		} else if (content === '5') {
			let tags = await client.handle('batchTags', [message.FromUserName], 101, true)
			let tag = await client.handle('fetchUsers', 101, '')
			console.log(tag)
			reply = JSON.stringify(tag)
		} else if (content === '6') {
			let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../20181126.mp4'))
			reply = {
				type: 'video',
				mediaId: data.media_id,
				title: '还有谁？',
				description: '我最帅，还有谁能比我帅?'
			}
		} else if (content === '7') {
			let data = await client.handle('uploadMaterial',
				'video',
				resolve(__dirname, '../20181126.mp4'),
				{
					type: 'video',
					description: '{"title": "这个地方很好", "introduction": "豪车莫不是莱斯劳斯！！！！"}'
				}
			)
			reply = {
				type: 'video',
				mediaId: data.media_id,
				title: '豪车 ？？',
				description: '我最帅，还有谁能比我帅?事实上2'
			}
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
