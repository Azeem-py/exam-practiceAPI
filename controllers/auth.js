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
    let user = await prisma.user.findUnique({ where: { email: email } })
    if (user) return false
    return true
  } catch (err) {
    console.log(err.message)
  }
}

const signup = async (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body
  if (!firstName && !lastName && !age && !email && !password && !password2)
    return res.status(400).json({ error: 'all fieldss required' })
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
        firstName,
        lastName,
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
    const User = await prisma.user.findUnique({
      where: { email: email },
      select: { password: true, lastName: true, id: true },
    })
    const id = User['id']
    // console.log(hashedPassword)
    const isMatch = await bcrypt.compare(password, User['password'])
    if (!isMatch)
      return res.status(403).json({ password: 'incorrect password' })
    const accessToken = generateAccessToken({ id })
    const refreshToken = generateRefreshToken({ id })
    const token = await prisma.token.create({
      data: {
        user: { connect: { id } },
        refreshToken,
        accessToken,
      },
    })
    // await token.save()
    console.log(token)
    return res.json({ accessToken, name: User['lastName'] })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = { signup, login }
