// schema
// model
// entity

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const CateporySchema = new Schema({
  // 分类名
  name: {
    unique: true,
    type: String
  },
  // 分类对应的电影ID
  movies: [{
    type: ObjectId,
    ref: 'Movie'
  }],
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

CateporySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

const Catepory = mongoose.model('Catepory', CateporySchema)
