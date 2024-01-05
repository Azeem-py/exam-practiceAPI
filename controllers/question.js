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
    questions.forEach(async (question) => {
      const { content, options } = question
      const newQuestion = await prisma.question.create({
        data: {
          content,
          questionOwner: { connect: { id: newTitle['id'] } },
        },
      })
      const questionID = newQuestion['id']
      options.forEach(async (option) => {
        const { name, is_correct } = option
        const newOption = await prisma.option.create({
          data: {
            content: name,
            is_correct,
            optionOwner: { connect: { id: questionID } },
          },
        })
        console.log(newOption)
      })
    })
    console.log(newTitle)
    res.status(201).json({ message: 'Title added successfully' })
  } catch (error) {
    console.error('Error adding title:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = { addQuestions }
