import DataItem from "./data-item.interface";

export default interface UpdatesObject{
  updatesForLocal: DataItem[]
  updatesForRemote: DataItem[]
}