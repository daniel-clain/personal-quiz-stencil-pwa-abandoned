import ITag from './tag.interface';
import DataItem from './data-item.interface'
import { CorrectnessRatings } from '../types/correctness-rating';

export default class IQuestion implements DataItem{
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