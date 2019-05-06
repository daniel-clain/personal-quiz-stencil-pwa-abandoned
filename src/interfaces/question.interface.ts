import ITag from './tag.interface';
import DataItem from './data-item.interface'

export default class IQuestion implements DataItem{
  id: string
  value: string
  correctAnswer: string
  correctnessRating: number
  dateLastAsked: Date
  dateLastUpdated: Date
  tags: ITag[]
}