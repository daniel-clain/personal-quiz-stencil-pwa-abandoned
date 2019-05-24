import IDataItem from "./data-item.interface";

export default interface IConflictingDataItem{
  remote: IDataItem
  local: IDataItem
}