module.exports = async (ctx, next) => {
	const message = ctx.weixin
	if (message.MsgType === 'text') {
		let content = message.Content
		let reply = 'Oh, 你说的' + content + ' 太复杂了，无法理解！！'

		if (content === '1') {
			reply = '天下第一可爱 -- 朱佩琪'
		} else if (content === '2') {
			reply = '天下第一美味 -- 肉夹馍'
		} else if (content === '3') {
			reply = '天下第一奇山 -- 珠穆朗玛'
		} else if (content === '4') {
			reply = '天下第一大河 -- 长江长，黄河黄'
		} else if (content === '帅哥') {
			reply = '天下第一帅哥 -- It\'s me'
		}
		ctx.body = reply
	}

	await next()
}