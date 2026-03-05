const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'HoopLog API is running 🏀' })
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
})