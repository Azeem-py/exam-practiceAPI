const express = require('express')
const cors = require('cors')

const { signup, login } = require('./controllers/auth')
const { addQuestions } = require('./controllers/question')

// a middleware for validating jwt
// const authenticateToken = require('./middlewares/authenticateToken')

const app = express()
app.use(cors())
app.use(express.json())
const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)

app.use('/auth', authRouter)

app.post('/add-question', addQuestions)

app.listen(3000, () => console.log('listening at 3000'))
