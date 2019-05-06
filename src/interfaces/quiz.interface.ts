import IQuestion from './question.interface';
import { CorrectnessRatings } from '../types/correctness-rating';

export default class IQuiz{
  questions: IQuestion[]
  answerSubmitted: boolean
  markedAs: CorrectnessRatings
  questionNumber: number
  answerValue: string

  constructor(questions: IQuestion[]){
    this.questions = questions
    this.answerValue = ''
    this.answerSubmitted = false
    this.markedAs = null
    this.questionNumber = 1
  }
}