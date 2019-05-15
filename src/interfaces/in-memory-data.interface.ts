import ITag from './tag.interface';
import IQuestion from './question.interface';

export default interface IInMemoryData{
  Questions: IQuestion[]
  Tags: ITag[]
}