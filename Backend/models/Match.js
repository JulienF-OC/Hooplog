const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema(
  {
    balldontlieId: {
      type: Number,
      required: true,
      unique: true,
    },

    date: {
      type: Date,
      required: true,
    },
    season: {
      type: Number,
      required: true,
    },
    postseason: {
      type: Boolean,
      default: false,
    },

    homeTeam: {
      teamId:       { type: Number, required: true },
      name:         { type: String, required: true },
      abbreviation: { type: String, required: true },
      score:        { type: Number, default: null },
    },
    visitorTeam: {
      teamId:       { type: Number, required: true },
      name:         { type: String, required: true },
      abbreviation: { type: String, required: true },
      score:        { type: Number, default: null },
    },

    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'final'],
      default: 'scheduled',
    },

    reviewStats: {
      count:        { type: Number, default: 0 },
      averageScore: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  }
)

matchSchema.index({ date: -1 })
matchSchema.index({ season: 1 })
matchSchema.index({ 'homeTeam.teamId': 1 })
matchSchema.index({ 'visitorTeam.teamId': 1 })

module.exports = mongoose.model('Match', matchSchema)