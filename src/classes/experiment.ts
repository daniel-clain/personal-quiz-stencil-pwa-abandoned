interface DataItem{

}
interface ConflictingDataItem{
  remote: DataItem
  local: DataItem
}

const clientConnectedToRemoteDbSubject = {subscribe: x => {}}
const remoteDbService = {
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb: (x): DataItem[] => x
}
const localDbService = {
  getUpdatedDataItemsSinceClientLastConnectedToRemoteDb: (x): DataItem[] => x,
  getDateLastConnectedToRemoteDb: (): Date => new Date()
}

enum CollectionNames{
  'Questions',
  'Tags'
}

const dataService = {
  getConflictingDataItems: (localDataItems: DataItem[], remoteDataItems: DataItem[]): ConflictingDataItem[] => null,
  getNonConflictingDataItems: (localDataItems: DataItem[], remoteDataItems: DataItem[]): ConflictingDataItem[] => null
}

const helperFunctions = {
  getDateOneMonthAgo: () => new Date(new Date().setMonth(new Date().getMonth() - 1))
}


clientConnectedToRemoteDbSubject.subscribe(() => {
  const dateLastConnectedToRemoteDb = localDbService.getDateLastConnectedToRemoteDb()
  const oneMonthAgo = helperFunctions.getDateOneMonthAgo()
  if(dateLastConnectedToRemoteDb == null || dateLastConnectedToRemoteDb < oneMonthAgo){
    // figure it out
  }
  else{
    synchronizeLocalAndRemoteData()
  }
})

var synchronizeLocalAndRemoteData = () => {
  for(let collectionName in CollectionNames){
    const localDataItems: DataItem[] = localDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName)
    const remoteDataItems: DataItem[] = remoteDbService.getUpdatedDataItemsSinceClientLastConnectedToRemoteDb(collectionName)

    const conflictingDataItems: ConflictingDataItem[] = dataService.getConflictingDataItems(localDataItems, remoteDataItems)
    const nonConflictingDataItems: ConflictingDataItem[] = dataService.getNonConflictingDataItems(localDataItems, remoteDataItems)


  }
}
Promise.all([])