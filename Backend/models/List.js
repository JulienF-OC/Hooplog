const mongoose = require('mongoose')

const listSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Titre requis'],
      maxlength: [100, 'Titre max 100 caractères'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description max 1000 caractères'],
      default: '',
    },

    matches: [
      {
        match: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Match',
          required: true,
        },
        note: {
          type: String,
          maxlength: [300, 'Note max 300 caractères'],
          default: '',
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],

    isPublic: {
      type: Boolean,
      default: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
)

listSchema.index({ user: 1, createdAt: -1 })

listSchema.post('save', async function (doc, next) {
  const User = mongoose.model('User')
  const List = mongoose.model('List')
  const count = await List.countDocuments({ user: this.user })
  await User.findByIdAndUpdate(this.user, { 'stats.listCount': count })
  next()
})

module.exports = mongoose.model('List', listSchema)