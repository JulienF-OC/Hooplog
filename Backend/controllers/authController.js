const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

const register = async (req, res) => {
  const { username, email, password } = req.body

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' })
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username'
      return res.status(400).json({ message: `${field} déjà utilisé` })
    }

    const user = await User.create({ username, email, password })

    res.status(201).json({
      _id:      user._id,
      username: user.username,
      email:    user.email,
      token:    generateToken(user._id),
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    }

    res.json({
      _id:          user._id,
      username:     user.username,
      email:        user.email,
      avatar:       user.avatar,
      bio:          user.bio,
      favoriteTeam: user.favoriteTeam,
      stats:        user.stats,
      token:        generateToken(user._id),
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
}

module.exports = { register, login, getMe }