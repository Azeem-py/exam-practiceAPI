const bcrypt = require('bcrypt')
const { prisma } = require('../db')

const {
  generateAccessToken,
  generateRefreshToken,
} = require('../helpers/tokenGenerator')

const emailUnique = async (email) => {
  if (!email) {
    return false
  }
  try {
    let user = await prisma.user.findFirst({ where: { email: email } })
    if (user) return false
    return true
  } catch (err) {
    console.log(err.message)
  }
}

const signup = async (req, res) => {
  const { email, password, password2 } = req.body
  if (!email && !password && !password2)
    return res.status(400).json({ error: 'all fields required' })
  if (password !== password) return res.sendStatus(400)

  let isUnique = await emailUnique(email)
  console.log('unique', isUnique)
  if (!isUnique)
    return res
      .status(400)
      .json({ usedEmail: 'email has been used by another user' })

  const hashedPassword = await bcrypt.hash(password, 10)
  console.log(hashedPassword)

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })
    console.log(newUser)
    return res.json(newUser)
  } catch (error) {
    console.log(error.message)
  }
}

const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).send('Email and password field required!')
  try {
    const User = await prisma.user.findFirst({
      where: { email: email },
      select: { password: true, id: true },
    })

    console.log('user', User)
    if (!User) {
      return res.status(400).json({ userError: 'User not found' })
    }
    const id = User['id']
    const isMatch = await bcrypt.compare(password, User['password'])
    if (!isMatch)
      return res.status(403).json({ password: 'incorrect password' })
    const accessToken = generateAccessToken({ id })
    const refreshToken = generateRefreshToken({ id })
    await prisma.token.create({
      data: {
        user: { connect: { id } },
        refreshToken,
        accessToken,
      },
    })
    return res.json({ accessToken })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = { signup, login }
