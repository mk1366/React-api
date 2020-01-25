const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({

  link: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Image', imageSchema)
