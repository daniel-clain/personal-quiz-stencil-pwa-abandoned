export default interface IReconcileDataService{
  synchronizeRemoteAndLocalDataBeforeLastConnected(): Promise<void>
  synchronizeRemoteAndLocalDataSinceLastConnected(): Promise<void>
}