
import IDataItem from "./data-item.interface";

export default interface INonConflictingDataItems{
  remote: IDataItem[]
  local: IDataItem[]
}