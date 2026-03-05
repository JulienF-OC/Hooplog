const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },

    score: {
      type: Number,
      required: [true, 'Score requis'],
      min: [1, 'Score minimum : 1'],
      max: [10, 'Score maximum : 10'],
    },

    content: {
      type: String,
      maxlength: [2000, 'Review max 2000 caractères'],
      default: '',
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    watchedOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

reviewSchema.index({ user: 1, match: 1 }, { unique: true })

reviewSchema.post('save', async function () {
  const Match = mongoose.model('Match')
  const Review = mongoose.model('Review')
  const User = mongoose.model('User')

  const stats = await Review.aggregate([
    { $match: { match: this.match } },
    {
      $group: {
        _id: '$match',
        averageScore: { $avg: '$score' },
        count:        { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await Match.findByIdAndUpdate(this.match, {
      'reviewStats.count':        stats[0].count,
      'reviewStats.averageScore': Math.round(stats[0].averageScore * 10) / 10,
    })
  }

  await User.findByIdAndUpdate(this.user, {
    $inc: { 'stats.reviewCount': 1 },
  })
})

module.exports = mongoose.model('Review', reviewSchema)