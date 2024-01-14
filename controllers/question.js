const { prisma } = require('../db')

const addQuestions = async (req, res) => {
  const { title, questions, time } = req.body
  if (!title) return res.status(400).json({ title: 'You need to add a title' })
  if (!questions) {
    res.status(400).json({ questions: 'You need to add questions' })
    return
  }

  const allOptions = questions.map((question) => question['options'])
  console.log('top options', allOptions)
  try {
    const NewTitle = await prisma.title.create({
      data: {
        title,
        time: Number(time),
        Question: {
          createMany: {
            data: questions.map((question) => {
              const { content } = question
              const newQuestion = {
                content,
              }
              return newQuestion
            }),
          },
        },
      },
      include: { Question: true, _count: true },
    })

    const newQuestions = NewTitle['Question']
    const newAllOptions = []
    allOptions.forEach((option, index) => {
      option.forEach((o) => {
        newAllOptions.push({ ...o, questionId: newQuestions[index]['id'] })
      })
    })

    console.log('new options', newAllOptions)

    const newOptions = await prisma.option.createMany({
      data: newAllOptions.map((options) => {
        const { name, is_correct, questionId } = options
        return { content: name, is_correct, questionId }
      }),
    })

    console.log(NewTitle)
    console.log('newOptions push', newOptions)

    res.status(201).json({ message: 'Title added successfully' })
  } catch (error) {
    console.error('Error adding title:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const listQuestions = async (req, res) => {
  try {
    const questions = await prisma.title.findMany({
      include: { _count: { select: { Question: true, Student: true } } },
    })
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
    return res.json({ question })
  } catch (error) {
    console.log(error.message)
  }
}

const answerQuestion = async (req, res) => {
  const { questionID } = req.params
  if (!questionID) {
    res.status(400).json({ error: 'Bad question request' })
    return
  }
  try {
    const question = await prisma.title.findUnique({
      where: { id: Number(questionID) },
      select: {
        title: true,
        time: true,
        Question: {
          select: {
            content: true,
            Option: { select: { is_correct: false, id: true, content: true } },
          },
        },
      },
    })
    res.json({ question })
    return
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
    let correctAnswers = 0

    for (let answer of answers) {
      const { is_correct } = await prisma.option.findUnique({
        where: { id: answer },
        select: { is_correct: true },
      })
      is_correct && correctAnswers++
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        score: correctAnswers,
        title: { connect: { id: Number(title) } },
      },
    })
    for (let answer of answers) {
      await prisma.studentAnswer.create({
        data: {
          answer: { connect: { id: answer } },
          student: {
            connect: { id: newStudent['id'] },
          },
        },
      })
    }

    // might use this one later
    // const newAnswers = await prisma.studentAnswer.createMany({
    //   data: answers.map((answer) => {
    //     return {
    //       optionId: answer,
    //       studentId: newStudent['id'],
    //     }
    //   }),
    // })
    // console.log('newAnswers', newAnswers)

    const questions = await prisma.title.findUnique({
      where: { id: Number(title) },
      select: {
        title: true,
        Question: {
          select: {
            content: true,
            Option: { select: { is_correct: true, id: true, content: true } },
          },
        },
        _count: { select: { Question: true } },
      },
    })
    return res.status(200).json({
      score: correctAnswers,
      questions,
    })
  } catch (error) {
    console.log(error.message)
  }
}

const studentResult = async (req, res) => {
  const { titleId } = req.params

  const results = await prisma.student.findMany({
    where: { titleId: Number(titleId) },
    select: { name: true, score: true },
  })
  return res.status(200).json({ results })
}

module.exports = {
  addQuestions,
  listQuestions,
  getQuestionData,
  answerQuestion,
  questionAnswered,
  studentResult,
}
