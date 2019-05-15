import DataItem from './data-item.interface'
export default interface ITag extends DataItem{
  id: string
  dateLastUpdated: Date;
  value: string
}