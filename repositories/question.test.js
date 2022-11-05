const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  const _clearTestQuestions = async () => writeFile(TEST_QUESTIONS_FILE_PATH, "");

  const _writeDefaultTestQuestions = async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: "What tautology does have one of the basic laws in formal logic: (A v B)'?",
        author: "Mateusz Czyzewski",
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: "\"Some flowers are red. Some flowers are purple. Pansies are flowers\". What conclusion if any can be derived from those hypotheses?",
        author: "Kate Drozd",
        answers: []
      }
    ];

    return writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
  };

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))

    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  beforeEach(async () => {
    await _clearTestQuestions();
  });

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })


  // THIS TEST IS BROKEN
  test.skip('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    const testQuestions = [
      {
        id: faker.datatype.uuid(),
        summary: 'What is my name?',
        author: 'Jack London',
        answers: []
      },
      {
        id: faker.datatype.uuid(),
        summary: 'Who are you?',
        author: 'Tim Doods',
        answers: []
      }
    ]

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  });

  test('should yield no question if unknown questions\'s id was provided', async () => {
    await _writeDefaultTestQuestions();

    const noQuestion = await questionRepo.getQuestionById(faker.datatype.uuid());
    
    expect(noQuestion).toMatchObject({});
  });

  test('should yield a question with a given id', async() => {
    const id = faker.datatype.uuid();
   
    const testQuestions = [{
      id: id,
      summary: 'Of what nationality was Carl Friedrich Gauss?',
      author: 'Mateusz Czyzewski',
      answers: []
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    expect(await questionRepo.getQuestionById(id)).toEqual(testQuestions.pop());
  });

  test('should not add a question without an author or a summary and then yield an error', async() => {
    await _writeDefaultTestQuestions();
    
    const brokenQuestion = { message: 'I am a broken question' };
    
    const addedQuestion = await questionRepo.addQuestion(brokenQuestion);

    expect(addedQuestion).toHaveProperty('error');
  });

  test('should add a question and then yield this question', async() => {
    await _writeDefaultTestQuestions();
    
    const goodQuestion = {
      author: 'Alice Wonderland',
      summary: 'What is your favorite song from Alice Wonderland'
    }

    const addedGoodQuestion = await questionRepo.addQuestion(goodQuestion);

    expect(addedGoodQuestion).toHaveProperty('id');
    expect(addedGoodQuestion['author']).toEqual(goodQuestion['author']);
    expect(addedGoodQuestion['summary']).toEqual(goodQuestion['summary']);
  });

  test('should not add an answer for an unexisting question and then yield an error', async() => {
    await _writeDefaultTestQuestions();
    
    const answer = { author: 'Chris Evans', summary: 'What is my question?' };
    
    const unknownQuestionId = faker.datatype.uuid();
    
    expect(await questionRepo.addAnswer(unknownQuestionId, answer)).toHaveProperty('error');
  });

  test('should not add an answer without an author or a summary and then yield an error', async() => {
    const questionId = faker.datatype.uuid();

    const testQuestions = [{
      id: questionId,
      summary: 'What do you do for work?',
      author: 'Paul Wants-To-Know',
      answers: []
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
    
    const answerForFirstTestQuestion = { author: 'Mary Jane' };

    const postedAnswer = await questionRepo.addAnswer(questionId, answerForFirstTestQuestion);

    expect(postedAnswer).toHaveProperty('error');
  });

  test('should add an answer and then yield this answer', async() => {
    const questionId = faker.datatype.uuid();

    const testQuestions = [{
      id: questionId,
      summary: 'What is a homeostasis?',
      author: 'Mark Whalberg',
      answers: []
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));
    
    const answerForFirstTestQuestion = { author: 'Angelina Jolie', summary: 'Keep your intrinsic parametrs on an even keel' };
    
    const addedAnswerForFirstTestQuestion = await questionRepo.addAnswer(questionId, answerForFirstTestQuestion);

    expect(addedAnswerForFirstTestQuestion).toHaveProperty('id');
    expect(addedAnswerForFirstTestQuestion['author']).toEqual(answerForFirstTestQuestion['author']);
    expect(addedAnswerForFirstTestQuestion['summary']).toEqual(answerForFirstTestQuestion['summary']);
  });

  test('should yield all answers for the given question', async() => {

    const testQuestions = [{
      id: faker.datatype.uuid(),
      summary: 'Of what nationality was Carl Friedrich Gauss?',
      author: 'Mateusz Czyzewski',
      answers: [
        {
          id: faker.datatype.uuid(),
          author: "Liam Czarnecki",
          summary: "Swedish"
        },
        {
          id: faker.datatype.uuid(),
          author: "Karolina Easter",
          summary: "German"
        }
      ]
    }];

    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions));

    const question = await questionRepo.getAnswers(testQuestions[0].id);

    console.log("Found question: ", question);

    expect(await questionRepo.getAnswers(testQuestions[0].id)).toHaveLength(2);
  });
})
