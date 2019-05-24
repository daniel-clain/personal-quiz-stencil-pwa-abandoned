import ITag from './tag.interface';
import IDataItem from './data-item.interface'

export default interface IQuestion extends IDataItem{
  id: string
  value: string
  correctAnswer: string
  correctnessRating: number
  dateLastAsked: Date
  dateLastUpdated: Date
  tags: ITag[]
  
}