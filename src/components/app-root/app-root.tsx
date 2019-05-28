import { Component, State, Listen } from '@stencil/core';
import { Views } from '../../global/types/views';
import { DataService } from '../../classes/data-service/data.service';
import RemoteDbService from '../../classes/remote-db-service/remote-db.service';
import LocalDbService from '../../classes/local-db-service/local-db.service';
import ReconcileDataService from '../../classes/data-service/reconcile-data.service';
import { AuthService } from "../../classes/auth-service/AuthService";
import firebase from 'firebase/app';
import { QuestionService } from '../../classes/question-service/question.service';
import { QuizGenertator } from '../../classes/quiz-generator/quiz-generator';


@Component({tag: 'app-root'})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  @Listen('viewSelected') 
  onViewSelected(event: CustomEvent){
    this.view = event.detail
  } 
  private dataService: DataService
  private authService: AuthService
  private questionService: QuestionService
  private quizGenerator: QuizGenertator

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
    const remoteDbService = new RemoteDbService(this.authService)
    const localDbService = new LocalDbService()
    const reconcileDataService = new ReconcileDataService(remoteDbService, localDbService)
    this.dataService = new DataService(remoteDbService, localDbService, reconcileDataService, this.authService)
    this.questionService = new QuestionService(this.dataService)
    this.quizGenerator = new QuizGenertator(this.questionService)
    this.dataService.setup()
    .then(() => console.log('DING! data service is setup !!');)
  }

  render() {
    return [
      <header>
        <nav-component authService={this.authService}></nav-component>
      </header>,
      <main>
        {[
          this.view == 'Start Quiz' &&
          <quiz-component 
            dataService={this.dataService}
            questionService={this.questionService}
            quizGenerator={this.quizGenerator}
          ></quiz-component>,
          this.view == 'Manage Questions' &&
          <questions-component dataService={this.dataService}></questions-component>
        ]}
      </main>
    ]
  }
}
