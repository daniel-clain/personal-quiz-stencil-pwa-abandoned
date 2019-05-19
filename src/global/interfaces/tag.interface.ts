import IDataItem from './data-item.interface'
export default interface ITag extends IDataItem{
  id: string
  dateLastUpdated: Date;
  value: string
}