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
  '也可以点击 <a href="' + config.baseUrl + '/">查电影</a>，查询电影信息\n'

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
      if (message.EventKey === 'help') {
        reply = help
      } else if (message.EventKey === 'movie_hot') {
        let movies = await api.movie.findHotMovies(-1, 4)
        reply = []

        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.summary,
            picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
            url: config.baseUrl + 'movie/' + item._id
          })
        })
      } else if (message.EventKey === 'movie_cold') {
        let movies = await api.movie.findHotMovies(1, 4)
        reply = []

        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.summary,
            picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
            url: config.baseUrl + 'movie/' + item._id
          })
        })
      } else if (message.EventKey === 'movie_sci') {
        let data = await api.movie.findMoviesByCat('科幻')
        let movies = data.movies.slice(0, 8)
        reply = []
        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.summary,
            picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
            url: config.baseUrl + 'movie/' + item._id
          })
        })
      } else if (message.EventKey === 'movie_love') {
        let data = await api.movie.findMoviesByCat('爱情')
        let movies = data.movies.slice(0, 8)
        reply = []
        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.summary,
            picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
            url: config.baseUrl + 'movie/' + item._id
          })
        })
      }
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

    if (content === 'imooc') {
      const countData = await api.wechat.saveMPUser(message, 'imooc')
      const user = countData.user
      const count = countData.count
      let nickname = user.nickname || ''

      if (user.gender === '1') {
        nickname = `小鲜肉 - ${nickname}`
      } else if (user.gender === '2') {
        nickname = `小姐姐 - ${nickname}`
      }

      let guess = '我猜不出你来自哪里，'

      if (user.province || user.city) {
        guess = `我猜你来自${user.province}省，${user.city}市，`
      }

      let end = `${guess}哈哈，这些信息只有你关注我才能从微信服务器拿到，别紧张，跟着 Scott 学习微信开发，你也可以快速做出一个属于自己的应用，加油！`

      reply = `哎呦喂！你是来自慕课的${nickname}，你有 ${count} 个来自慕课的小伙伴开始研究这个课程了，${end}`
    } else if (content === '首页') {
      reply = [{
        title: '时光的预热',
        description: '匆匆岁月时光去，总有一款你最爱',
        picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
        url: config.baseUrl
      }]
    } else if (content === '更新菜单') {
      try {
        const del = await client.handle('deleteMenu')
        const create = await client.handle('createMenu', commonMenu)
      } catch (err) {
        console.log(err)
      }
      reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
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
        movies.forEach(item => {
          reply.push({
            title: item.title,
            description: item.summary,
            picUrl: 'https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png',
            url: config.baseUrl + 'movie/' + item._id
          })
        })
      } else {
        reply = '没有查询到与 ' + content + ' 相关的电影，要不要换一个名字试试看哦！'
      }
    }

    ctx.body = reply
  } else if (message.MsgType === 'voice') {
    let content = message.Recognition
    let reply = ''
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

    ctx.body = reply
  } else if (message.MsgType === 'image') {

  } else if (message.MsgType === 'video') {
  } else if (message.MsgType === 'shortvideo') {
  } else if (message.MsgType === 'location') {
  } else if (message.MsgType === 'link') {
  }

	await next()
}
