require('dotenv').config()
const jwt = require('jsonwebtoken')

const generateAccessToken = (email) => {
  return jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
}

const generateRefreshToken = (email) => {
  return jwt.sign(email, process.env.REFRESH_TOKEN_SECRET)
}

module.exports = { generateAccessToken, generateRefreshToken }
