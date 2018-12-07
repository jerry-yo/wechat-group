// schema comment 设计
// 实现 controller
// 增加对应路由
// 增加评论的表单以及展现评论列表

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
  movie: {
    type: ObjectId,
    ref: 'Movie'
  },
  from: {
    type: ObjectId,
    ref: 'User'
  },
  content: String,
  replies: [
    {
      from: {
        type: ObjectId,
        ref: 'User'
      },
      to: {
        type: ObjectId,
        ref: 'User'
      },
      content: String,
    }
  ],
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

CommentSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

const Comment = mongoose.model('Comment', CommentSchema)