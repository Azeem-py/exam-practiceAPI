const express = require('express')
const cors = require('cors')

const { signup, login } = require('./controllers/auth')
const {
  addQuestions,
  listQuestions,
  getQuestionData,
  answerQuestion,
  questionAnswered,
  studentResult,
} = require('./controllers/question')

const { authenticateToken } = require('./middlewares/authenticateToken')

// a middleware for validating jwt
// const authenticateToken = require('./middlewares/authenticateToken')

const app = express()
const corsOptions = {
  origin: 'http://localhost:5173',
}

// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   next()
// })
app.use(cors(corsOptions))
app.use(express.json())
const authRouter = express.Router()

authRouter.post('/signup', signup)
authRouter.post('/login', login)

app.use('/auth', authRouter)

app.post('/add-question', authenticateToken, addQuestions)
app.get('/list-questions', authenticateToken, listQuestions)
app.get('/question-data/:questionID', authenticateToken, getQuestionData)
app.get('/answer-question/:questionID', answerQuestion)
app.post('/question-submit', questionAnswered)
app.get('/students-results/:titleId', authenticateToken, studentResult)

app.listen(3000, () => console.log('listening at 3000'))
