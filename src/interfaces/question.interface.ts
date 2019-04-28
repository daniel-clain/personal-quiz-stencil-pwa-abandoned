import ITag from './tag.interface';
import { CorrectnessRatings } from '../types/correctness-rating';

export default interface IQuestion{
  id: string
  value: string
  correctAnswer: string
  correctnessRating: number
  dateLastAsked: Date
  dateLastUpdated: Date
  tags: ITag[]
  answer?: string
  markedAs?: CorrectnessRatings
}