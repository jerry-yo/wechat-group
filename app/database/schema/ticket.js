// schema
// model
// entity

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TicketSchema = new Schema({
  name: String,
  ticket: String,
  expires_in: Number,
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

TicketSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TicketSchema.statics = {
  async getTicket () {
    const ticket = await this.findOne({
      name: 'ticket'
    })
    if (ticket && ticket.ticket) {
      ticket.ticket = ticket.ticket
      console.log(ticket, 'get')
    }

    return ticket
  },
  async saveTicket (data) {
    let ticket = await this.findOne({
      name: 'ticket'
    })

    if (ticket) {
      ticket.ticket = data.ticket
      ticket.expires_in = data.expires_in
    } else {
      ticket = new Ticket({
        name: 'ticket',
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }
    await ticket.save()

    return ticket
  }
}

const Ticket = mongoose.model('Ticket', TicketSchema)
