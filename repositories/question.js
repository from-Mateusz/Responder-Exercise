
const { readFile, writeFile } = require('fs/promises')
const { v4: uuidV4 } = require("uuid");

const makeQuestionRepository = fileName => {

  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)

    return questions
  }

  const getQuestionById = async questionId => { 
    const questions = await getQuestions();

    const question = questions.find(question => question.id === questionId);
    
    return question || {};
  }

  const addQuestion = async question => {
    if(!_isCompleteQuestion(question)) return { error: "Provided no author or no summary"};

    const questions = await getQuestions();
    
    const questionCopy = { id: uuidV4(), ...question };

    questions.push(questionCopy);

    await writeFile(fileName, JSON.stringify(questions));

    return questionCopy;
  }

  const getAnswers = async questionId => {
    const question = await _getQuestionById(questionId);

    if(!question) return { error: "Question doesn't exist"};
  
    return question.answers || [];
  } 

  const getAnswer = async (questionId, answerId) => {
    const question = await _getQuestionById(questionId);

    if(!question) return { error: "Question doesn't exist"};
  
    const answer = question.answers.find(answer => answer.id === answerId);

    return answer || {};
  }

  const addAnswer = async (questionId, answer) => {
    const questions = await getQuestions();

    const question = questions.find(q => questionId == q.id);

    if(!question) return { error: "Question doesn't exist"};

    if(!_isCompleteAnswer(answer)) return { error: "Provided no author or no summary"}

    const answerCopy = { id: uuidV4(), ...answer };

    question.answers.push(answerCopy);

    await writeFile(fileName, JSON.stringify(questions));

    return answerCopy;
  }

  const _isCompleteQuestion = (question) => {
    return 'author' in question && 'summary' in question; 
  }

  const _isCompleteAnswer = (answer) => {
    return 'author' in answer && 'summary' in answer;
  }
  
  const _getQuestionById = async (questionId) => {

    const question = await getQuestionById(questionId);

    const isEmptyQuestion = Object.keys(question).length === 0;

    return isEmptyQuestion ? undefined : question;
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
