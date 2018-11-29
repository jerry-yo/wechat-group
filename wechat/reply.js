const {resolve} = require('path')

module.exports = async (ctx, next) => {
	const message = ctx.weixin

	let mp = require('./index')
	let client = mp.getWechat()

	if (message.MsgType === 'event') {
		let reply
		if (message.Event === 'LOCATION') {
			reply = `您上报位置是：${message.Latitude},${message.Longitude}精度：${message.Precision}`
		} else if (message.Event === 'subscribe') {
			if (message.EventKey) {
				reply =`偷偷爱上我${message.EventKey} -- ${message.Ticket}`
			}
			reply = '偷偷爱上我'
		} else if (message.Event === 'unsubscribe') {
			reply ='狠心抛弃我'
		} else if (message.Event === 'SCAN') {
			reply = `扫我 == ${message.EventKey} == ${message.Ticket}`
		} else if (message.Event === 'CLICK') {
			reply = '点击菜单拉取消息时的事件推送'
		} else if (message.Event === 'VIEW') {
			reply = `点击菜单跳转链接时的事件推送 ${message.EventKey}`
		} else if (message.Event === 'scancode_push') {
			reply = '扫码推事件的事件推送'
		} else if (message.Event === 'scancode_waitmsg') {
			reply = '扫码推事件且弹出“消息接收中”提示框的事件推送'
		} else if (message.Event === 'pic_sysphoto') {
			reply = '弹出系统拍照发图的事件推送'
		} else if (message.Event === 'pic_photo_or_album') {
			reply = '弹出拍照或者相册发图的事件推送'
		} else if (message.Event === 'pic_weixin') {
			reply = '弹出微信相册发图器的事件推送'
		} else if (message.Event === 'location_select') {
			reply = '弹出地理位置选择器的事件推送'
		}
		ctx.body = reply
	} else if (message.MsgType === 'text') {
		let content = message.Content
		let reply = 'Oh, 你说的' + content + ' 太复杂了，无法理解！！'

		if (content === '1') {
			reply = '完成'
		} else if (content === '2') {
			reply = '删除菜单'
		} else if (content === '3') {
			reply = 'sss'
		} else if (content === '4') {
			reply = 'mini'
		} else if (content === '5') {
			reply = '打标签'
		} else if (content === '6') {
			reply = 'JSON.stringify(data)'
		}
		ctx.body = reply
	}

	await next()
}
