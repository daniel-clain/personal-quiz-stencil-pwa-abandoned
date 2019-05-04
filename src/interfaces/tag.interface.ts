import DataItem from './data-item.interface'
export default class ITag implements DataItem{
  id: string
  dateLastUpdated: Date;
  name: string
}