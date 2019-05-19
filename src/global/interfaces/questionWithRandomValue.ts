import IQuestion from './question.interface';

export default interface IQuestionWithRandomValue extends IQuestion{
  randomValue: number
}