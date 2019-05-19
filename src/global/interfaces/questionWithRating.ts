import IQuestion from './question.interface';

export default interface IQuestionWithRating extends IQuestion{
  rating: number
}