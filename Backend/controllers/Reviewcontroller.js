const Review = require('../models/Review')
const Match  = require('../models/Match')
const Activity = require('../models/Activity')

const createReview = async (req, res) => {
  const { matchId, score, content, watchedOnly } = req.body

  try {
    if (!matchId || !score) {
      return res.status(400).json({ message: 'matchId et score requis' })
    }

    const match = await Match.findById(matchId)
    if (!match) {
      return res.status(404).json({ message: 'Match introuvable' })
    }

    const existing = await Review.findOne({ user: req.user._id, match: matchId })
    if (existing) {
      return res.status(400).json({ message: 'Tu as déjà noté ce match' })
    }

    const review = await Review.create({
      user:        req.user._id,
      match:       matchId,
      score,
      content:     content || '',
      watchedOnly: watchedOnly || false,
    })

    await Activity.create({
      actor:  req.user._id,
      type:   'review_created',
      review: review._id,
      match:  matchId,
    })

    await review.populate('user', 'username avatar')
    await review.populate('match', 'homeTeam visitorTeam date')

    res.status(201).json(review)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getReviewsByMatch = async (req, res) => {
  try {
    const page    = parseInt(req.query.page)  || 1
    const limit   = parseInt(req.query.limit) || 10
    const skip    = (page - 1) * limit

    const reviews = await Review.find({ match: req.params.matchId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ match: req.params.matchId })

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getReviewsByUser = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 10
    const skip  = (page - 1) * limit

    const reviews = await Review.find({ user: req.params.userId })
      .populate('match', 'homeTeam visitorTeam date season')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ user: req.params.userId })

    res.json({
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user',  'username avatar')
      .populate('match', 'homeTeam visitorTeam date season')

    if (!review) {
      return res.status(404).json({ message: 'Review introuvable' })
    }

    res.json(review)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: 'Review introuvable' })
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    const { score, content, watchedOnly } = req.body

    if (score !== undefined)       review.score       = score
    if (content !== undefined)     review.content     = content
    if (watchedOnly !== undefined) review.watchedOnly = watchedOnly

    await review.save()
    await review.populate('user',  'username avatar')
    await review.populate('match', 'homeTeam visitorTeam date')

    res.json(review)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: 'Review introuvable' })
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    await review.deleteOne()

    res.json({ message: 'Review supprimée' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const toggleLike = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({ message: 'Review introuvable' })
    }

    const userId    = req.user._id.toString()
    const likeIndex = review.likes.findIndex((id) => id.toString() === userId)

    if (likeIndex === -1) {
      review.likes.push(req.user._id)
      await Activity.create({
        actor:  req.user._id,
        type:   'review_liked',
        review: review._id,
      })
    } else {
      review.likes.splice(likeIndex, 1)
    }

    await review.save()

    res.json({ likes: review.likes.length, liked: likeIndex === -1 })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = {
  createReview,
  getReviewsByMatch,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
  toggleLike,
}