const mongoose = require('mongoose')

const ACTIVITY_TYPES = [
  'review_created',   
  'list_created',     
  'list_updated',     
  'user_followed',  
  'review_liked',   
  'list_liked',  
]

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },

    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      default: null,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

activitySchema.index({ actor: 1, createdAt: -1 })
activitySchema.index({ createdAt: -1 })

module.exports = mongoose.model('Activity', activitySchema)
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES