import { Component, State, Listen } from '@stencil/core';
import { Views } from '../../types/views';
import DataService from '../../classes/data-service/data.service';
import FirestoreDbService from '../../classes/firestore-db-service/firestore-db.service';
import LocalDbService from '../../classes/local-db-service/local-db.service';
import ReconcileDataService from '../../classes/data-service/reconcile-data.service';
import { AuthService } from '../../classes/auth-service/auth.service';


@Component({tag: 'app-root'})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  @Listen('viewSelected') 
  dataService: DataService

  componentWillLoad(){
    const firestoreDbService = new FirestoreDbService()
    const localDbService = new LocalDbService()
    const reconcileDataService = new ReconcileDataService()
    const authService = new AuthService()
    this.dataService = new DataService(firestoreDbService, localDbService, reconcileDataService, authService)
  }

  onViewSelected(event: CustomEvent){
    this.view = event.detail
  }


  render() {
    return [
      <header>
        <nav-component></nav-component>
      </header>,
      <main>
        {[
          this.view == 'Start Quiz' &&
          <quiz-component dataService={this.dataService}></quiz-component>,
          this.view == 'Manage Questions' &&
          <questions-component dataService={this.dataService}></questions-component>
        ]}
      </main>
    ]
  }
}
