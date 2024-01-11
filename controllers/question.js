const { prisma } = require('../db')

const addQuestions = async (req, res) => {
  const { title, questions } = req.body
  if (!title) return res.status(400).json({ title: 'You need to add a title' })
  if (!questions)
    return res.status(400).json({ questions: 'You need to add questions' })
  // const parsedQuestion = JSON.parse(questions)
  // console.log(questions, typeof questions)
  try {
    const newTitle = await prisma.title.create({ data: { title } })
    for (const question of questions) {
      const { content, options } = question
      const newQuestion = await prisma.question.create({
        data: {
          content,
          questionOwner: { connect: { id: newTitle.id } },
        },
      })
      const questionID = newQuestion.id

      for (const option of options) {
        const { name, is_correct } = option
        const newOption = await prisma.option.create({
          data: {
            content: name,
            is_correct,
            optionOwner: { connect: { id: questionID } },
          },
        })
        console.log(newOption)
      }
    }
    res.status(201).json({ message: 'Title added successfully' })
  } catch (error) {
    console.error('Error adding title:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const listQuestions = async (req, res) => {
  try {
    const questions = await prisma.title.findMany({
      include: { _count: { select: { Question: true } } },
    })
    console.log(questions)
    return res.json({ questions })
  } catch (e) {
    console.log(e.message)
  }
}

const getQuestionData = async (req, res) => {
  const { questionID } = req.params
  try {
    const question = await prisma.title.findUnique({
      where: { id: Number(questionID) },
      select: {
        title: true,
        Question: { select: { content: true, Option: true } },
      },
    })
    console.log(question)
    return res.json({ question })
  } catch (error) {
    console.log(error.message)
  }
}

const answerQuestion = async (req, res) => {
  const { questionID } = req.params
  if (!questionID)
    return res.status(400).json({ error: 'Bad question request' })
  try {
    const question = await prisma.title.findUnique({
      where: { id: Number(questionID) },
      select: {
        title: true,
        Question: {
          select: {
            content: true,
            Option: { select: { is_correct: false, id: true, content: true } },
          },
        },
      },
    })
    console.log(question)
    return res.json({ question })
  } catch (error) {
    console.log(error.message)
  }
}

const questionAnswered = async (req, res) => {
  const { name, answers, title } = req.body
  console.log(title)
  if (!name || !answers)
    return res.status(500).json({ 'invalid request': 'names answers required' })

  try {
    const newStudent = await prisma.student.create({
      data: { name, title: { connect: { id: Number(title) } } },
    })
    for (let answer of answers) {
      await prisma.studentAnswer.create({
        data: {
          answer: { connect: { id: answer } },
          student: { connect: { id: newStudent['id'] } },
        },
      })
    }

    const totalQuestion = await prisma.question.count({
      where: { titleId: Number(title) },
    })
    let correctAnswers = 0

    const questionIdList = []
    const correctAnswersIds = []
    for (let answer of answers) {
      const { is_correct, questionId } = await prisma.option.findUnique({
        where: { id: answer },
        select: { is_correct: true, questionId: true },
      })
      is_correct && correctAnswers++
      questionIdList.push(questionId)

      // this id is the id of the correct options related to the gotten questionId
      const { id } = await prisma.option.findFirst({
        where: { questionId, is_correct: true },
        select: { id: true },
      })
      correctAnswersIds.push(id)
    }

    return res.status(200).json({
      score: correctAnswers,
      totalQuestion,
      correctOptions: correctAnswersIds,
    })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  addQuestions,
  listQuestions,
  getQuestionData,
  answerQuestion,
  questionAnswered,
}
