import { ITag } from "./tag.interface";

export default interface IQuestion{
  id: string
  value: string
  correctAnswer: string
  correctnessRating: number
  dateLastAsked: Date
  dateLastUpdated: Date
  tags: ITag[]
}