import { Component, State, Listen } from '@stencil/core';
import { Views } from '../../global/types/views';
import { DataService } from '../../classes/data-service/data.service';
import FirestoreDbService from '../../classes/firestore-db-service/firestore-db.service';
import LocalDbService from '../../classes/local-db-service/local-db.service';
import ReconcileDataService from '../../classes/data-service/reconcile-data.service';
import { AuthService } from '../../classes/auth-service/auth.service';
import firebase from 'firebase/app';


@Component({tag: 'app-root'})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  @Listen('viewSelected') 
  onViewSelected(event: CustomEvent){
    this.view = event.detail
  } 
  dataService: DataService
  authService: AuthService

  componentWillLoad(){
    firebase.initializeApp(
      {
        apiKey: 'AIzaSyB4ffPYSF_0sgjQJXt-GcnE0ifTBof4yTI',
        authDomain: 'personalquiz-93810.firebaseapp.com',
        databaseURL: 'https://personalquiz-93810.firebaseio.com',
        projectId: 'personalquiz-93810',
        storageBucket: 'personalquiz-93810.appspot.com',
        messagingSenderId: '1066599785491'
      }
    )
    this.authService = new AuthService()
    const firestoreDbService = new FirestoreDbService(this.authService)
    const localDbService = new LocalDbService()
    const reconcileDataService = new ReconcileDataService(firestoreDbService, localDbService)
    this.dataService = new DataService(firestoreDbService, localDbService, reconcileDataService, this.authService)
    this.dataService.setup()
  }

  render() {
    return [
      <header>
        <nav-component authService={this.authService}></nav-component>
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
