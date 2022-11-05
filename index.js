const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', async (req, res) => {
  const { questionId } = req.params;
  const question = await req.repositories.questionRepo.getQuestionById(questionId);
  res.json(question);
})

app.post('/questions', async (req, res) => {
  const question = req.body;
  const postedQuestion = await req.repositories.questionRepo.addQuestion(question);
  return res.json(postedQuestion);
})

app.get('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params;
  const answers = await req.repositories.questionRepo.getAnswers(questionId);
  return res.json(answers);
})

app.post('/questions/:questionId/answers', async (req, res) => {
  const { questionId } = req.params;
  const newAnswer = req.body;
  const postedAnswer = await req.repositories.questionRepo.addAnswer(questionId, newAnswer);
  return res.json(postedAnswer);
})

app.get('/questions/:questionId/answers/:answerId', async (req, res) => {
  const { questionId, answerId } = req.params;
  const answers = await req.repositories.questionRepo.getAnswer(questionId, answerId);
  return res.json(answers);
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
