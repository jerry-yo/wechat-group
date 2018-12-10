const {resolve} = require('path')
const commonMenu = require('./menu')
const config = require('../config/config')
const api = require('../app/api/index')

const help = '亲爱的，欢迎关注时光的余热\n' +
  '回复 1-3，测试文字回复\n' +
  '回复 4，测试图片回复\n' +
  '回复 首页，进入网站首页\n' +
  '回复 电影名字，查询电影信息\n' +
  '点击帮助，获取帮助信息\n' +
  '某些功能呢订阅号无权限，比如网页授权\n' +
  '回复语音，查询电影信息\n' +
  '也可以点击 <a href="' + config.baseUrl + '/sdk">语音查电影</a>，查询电影信息\n'

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

		if (content === '首页') {
      reply = [{
        title: '时光的预热',
        description: '匆匆岁月时光去，总有一款你最爱',
        picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
        url: config.baseUrl
      }]
    } else {
      let movies = await api.movie.searchByKeyword(content)
      reply = []

      if (!movies || movies.length === 0) {
        let catData = await api.movie.findMoviesByCat(content)

        if (catData) {
          movies = catData.movies
        }
      }

      if (!movies || movies.length === 0) {
        movies = await api.movie.searchByDouban(content)
      }

      if (!movies || movies.length) {
        movies = movies.slice(0, 4)

        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      } else {
        reply = '没有查询到与 ' + content + ' 相关的电影，要不要换一个名字试试看哦！'
      }
    }

    ctx.body = reply
  }

	await next()
}
