const express = require('express')
const router  = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  createReview,
  getReviewsByMatch,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
  toggleLike,
} = require('../controllers/reviewController')

// Création
router.post('/',                       protect, createReview)

// Lecture
router.get('/match/:matchId',                   getReviewsByMatch)
router.get('/user/:userId',                     getReviewsByUser)
router.get('/:id',                              getReviewById)

// Modification / Suppression (auteur uniquement)
router.put('/:id',                     protect, updateReview)
router.delete('/:id',                  protect, deleteReview)

// Like / Unlike
router.post('/:id/like',               protect, toggleLike)

module.exports = router