
import { QuizGenertator } from "./quiz-generator";
import { QuestionService } from "../question-service/question.service";
import IQuiz from '../../interfaces/quiz.interface';
import IQuestion from '../../interfaces/question.interface';
import ITag from '../../interfaces/tag.interface';

let highestRandomValue = jest.fn().mockReturnValue(1)

let randomMockReturns = highestRandomValue

jest.mock('../../helper-functions/random', () => ({
  ...jest.requireActual('../../helper-functions/random'),
  default: () => randomMockReturns(),
  
}))

const baseQuestion: IQuestion = {
  id: 'base question',
  value: undefined,
  correctAnswer: undefined,
  correctnessRating: 5,
  dateLastAsked: new Date('April 20, 2019 17:30'),
  dateLastUpdated: undefined,
  tags: []
}


const makeTestQuestions = (question: IQuestion, amount) => {
  const returnQuestions: IQuestion[] = []
  for(;returnQuestions.length < amount;){
    returnQuestions.push(question)
  }
  return returnQuestions
}

let mockReturnedQuestions: IQuestion[]

class MockQuestionService extends QuestionService{
  getQuestionsByTag(_tags?: ITag[]): Promise<IQuestion[]>{
    return jest.fn().mockResolvedValue(mockReturnedQuestions)()
  }
}

const mockQuestionService: MockQuestionService = new MockQuestionService(null)

describe ('generateQuiz()', () => {
  

  describe('it returns a quiz with 10 random questions, the random questions selected should be weighted based on how often they are answered incorrectly, and how long its been since last asked', () => {
    describe('when selected tags argument is always null', () => {
      describe('when random value is 1 every time', () => {
        randomMockReturns = jest.fn().mockReturnValue(1)
        describe('when there are 10 base questions with correctnessRating of 5 and dateLastAsked is 20th April 2019', () => {
          
          const tenBaseQuestions = makeTestQuestions(baseQuestion, 10)
          mockReturnedQuestions = tenBaseQuestions

          describe('when test question has same correctnessRating as base questions but was asked 1 day MORE recently than base questions', async () => {
            const testQuestion: IQuestion = {
              id: 'test question',
              value: undefined,
              correctAnswer: undefined,
              correctnessRating: 5,
              dateLastAsked: new Date('April 21, 2019 17:30'),
              dateLastUpdated: undefined,
              tags: []
            }

            mockReturnedQuestions.push(testQuestion)

            const quizGeneratorInstance = new QuizGenertator(mockQuestionService)
            const returnedQuiz: IQuiz = await quizGeneratorInstance.generateQuiz()

            test('should return 10 questions', () => {
              expect(returnedQuiz.questions.length).toBe(10)
            })

            test('returned quiz should not include test question', () => {
              returnedQuiz.questions.forEach(
                (question: IQuestion) => expect(question.id).not.toBe('test question')
              )
            });

          })
          
          describe('when test question has same correctnessRating as base questions but was asked 1 day LESS recently than base questions', () => {
            const tenBaseQuestions = makeTestQuestions(baseQuestion, 10)
            mockReturnedQuestions = tenBaseQuestions

            test('returned quiz should include test question', async () => {
              const testQuestion: IQuestion = {
                id: 'test question',
                value: undefined,
                correctAnswer: undefined,
                correctnessRating: 5,
                dateLastAsked: new Date('April 19, 2019 17:30'),
                dateLastUpdated: undefined,
                tags: []
              }
  
              mockReturnedQuestions.push(testQuestion)
  
              const quizGeneratorInstance = new QuizGenertator(mockQuestionService)
              const returnedQuiz: IQuiz = await quizGeneratorInstance.generateQuiz()
              expect(returnedQuiz.questions.some((question: IQuestion) => question.id == 'test question')).toBe(true)

            })

          })          
        })
      })
    })
  })
})