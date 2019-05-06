
import DataItem from './data-item.interface'
export default class ClientData implements DataItem{
  dateLastUpdated: Date;
  value: string;
  id: string
}