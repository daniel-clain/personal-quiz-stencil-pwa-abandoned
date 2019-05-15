import DataItem from "../../interfaces/data-item.interface";
import UpdatesObject from "../../interfaces/updates-object.interface";
import CollectionNames from "../../types/collection-names";
import IQuestion from "../../interfaces/question.interface";

export default class ReconcileDataService{
  reconcileData(localDataItems: DataItem[], remoteDataItems: DataItem[], collectionName: CollectionNames): UpdatesObject{

    const resolvedConflictedItems: UpdatesObject = {
      updatesForLocal: [],
      updatesForRemote: []
    }
    localDataItems.forEach(
      (localData: DataItem) => {
        remoteDataItems.forEach((remoteData: DataItem) => {
          if(remoteData.id == localData.id){
            if(collectionName == 'Questions'){
              const remoteQuestion: IQuestion = remoteData as IQuestion
              const localQuestion: IQuestion = localData as IQuestion
              if(localQuestion.dateLastUpdated > remoteQuestion.dateLastUpdated){
                if(localQuestion.dateLastAsked != localQuestion.dateLastUpdated &&
                  remoteQuestion.dateLastAsked == remoteQuestion.dateLastUpdated){
                  const modifiedCorrectnessRating = Math.round(
                    localQuestion.correctnessRating * 0.7 + remoteQuestion.correctnessRating * 0.3
                  )
                  resolvedConflictedItems.updatesForRemote.push({...localQuestion, correctnessRating: modifiedCorrectnessRating} as IQuestion)
                }
                else{
                  resolvedConflictedItems.updatesForRemote.push(localData)
                }
              }
              else{
                if(remoteQuestion.dateLastAsked != remoteQuestion.dateLastUpdated &&
                  localQuestion.dateLastAsked == localQuestion.dateLastUpdated){
                  const modifiedCorrectnessRating = Math.round(
                    remoteQuestion.correctnessRating * 0.7 + localQuestion.correctnessRating * 0.3
                  )
                  resolvedConflictedItems.updatesForLocal.push({...remoteQuestion, correctnessRating: modifiedCorrectnessRating} as IQuestion)
                }
                else{
                  resolvedConflictedItems.updatesForLocal.push(remoteQuestion)
                }
              }
            }
            if(collectionName == 'Tags'){
              if(localData.dateLastUpdated > remoteData.dateLastUpdated){
                resolvedConflictedItems.updatesForRemote.push(localData)
              }
              else{
                resolvedConflictedItems.updatesForLocal.push(remoteData)
              }
            }
          }
        })
      }
    )

    
    const dataThatLocalHasThatRemoteDoesnt = localDataItems.filter(
      (localData: DataItem) => !remoteDataItems.some((remoteData: DataItem) => remoteData.id == localData.id)
    )
    console.log(dataThatLocalHasThatRemoteDoesnt);

    
    const dataThatRemoteHasThatLocalDoesnt = remoteDataItems.filter(
        (remoteData: DataItem) => !localDataItems.some((localData: DataItem) => localData.id == remoteData.id)
    )
    console.log(dataThatRemoteHasThatLocalDoesnt);

    


    return {
      updatesForLocal: dataThatRemoteHasThatLocalDoesnt,
      updatesForRemote: dataThatLocalHasThatRemoteDoesnt
    }
  }

  
}