// 1. 实现一个注册页面的控制器 showSignup
// 2. 增加一个登录页面的控制 showSignin
// 3. 用户数据的持久化 signup
// 4. 增加一个登录的校验和判断 signin
// 5. 增加路由规则
// 6. 增加两个PUG页面， 注册和登录
// 7. Koa-bodyparser
const mongoose = require('mongoose')
const User = mongoose.model('User')

exports.showSignup = async (ctx, next) => {
  await ctx.render('pages/signup', {
    title: '注册页面'
  })
}

exports.showSignin = async (ctx, next) => {
  await ctx.render('pages/signin', {
    title: '登录页面'
  })
}

exports.signup = async (ctx, next) => {
  const {
    email,
    password,
    nickname
  } = ctx.request.body.user
  console.log('get logger', email, password, nickname)
  let user = await User.findOne({email})

  if (user) return ctx.redirect('/user/signin')

  user = new User({
    email,
    nickname,
    password
  })
  console.log('new User', user)
  ctx.session.user = {
    _id: user._id,
    nickname: user.nickname
  }

  user = await user.save()

  ctx.redirect('/')
}

exports.signin = async (ctx, next) => {
  const {email, password} = ctx.request.body.user
  const user = await User.findOne({email})

  if (!user) return ctx.redirect('/user/signup')

  const isMatch = await user.comparePassword(password, user.password)
  console.log(user)

  if (isMatch) {
    ctx.session.user = {
      _id: user._id,
      nickname: user.nickname
    }

    ctx.redirect('/')
  } else {
    ctx.redirect('/user/signin')
  }
}

exports.logout = async (ctx, next) => {
  ctx.session.user = {}

  ctx.redirect('/')
}
