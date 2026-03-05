
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config()
connectDB()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'HoopLog API is running 🏀' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
})