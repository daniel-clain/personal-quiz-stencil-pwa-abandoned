import { Component, State, Prop } from '@stencil/core';
import { QuestionService } from "../../classes/question-service/question.service";
import ITag from '../../global/interfaces/tag.interface';
import IQuiz from '../../global/interfaces/quiz.interface';
import { CorrectnessRatings } from '../../global/types/correctness-rating';
import IQuestion from '../../global/interfaces/question.interface';
import { QuizGenertator } from '../../classes/quiz-generator/quiz-generator';
import { DataService } from '../../classes/data-service/data.service';

@Component({ tag: 'quiz-component' })
export class QuizComponent {
  @Prop() dataService: DataService
  @State() activeQuiz: IQuiz
  private questionsInQuiz: number
  private questionService: QuestionService
  @State() tags: ITag[]
  @State() questions: IQuestion[]
  @State() quizTags: ITag[] = []
  @State() notEnoughQuestions: boolean = false
  private quizGenerator: QuizGenertator

  componentWillLoad() {
    this.questionService = new QuestionService(this.dataService)
    this.dataService.tags$.subscribe((tags: ITag[]) => this.tags = tags)
    this.dataService.questions$.subscribe((questions: IQuestion[]) => this.questions = questions)
    this.quizGenerator = new QuizGenertator(this.questionService)
    this.questionsInQuiz = this.quizGenerator.questionsInQuiz
  }
  toggleQuizTag(tag: ITag){
    const alreadyInTheList = this.quizTags.some((quizTag: ITag) => quizTag.id == tag.id)
    if(alreadyInTheList){
      this.quizTags.filter((quizTag: ITag) => quizTag.id != tag.id)
    } else {
      this.quizTags.push(tag)
    }
  }
  
  answerValueChange(event){
    this.activeQuiz.answerValue =  event.path[0].value
  }

  async startQuiz(){
    this.quizGenerator.generateQuiz()
    .then(
      (quiz: IQuiz) => {
        this.activeQuiz = quiz
      },
      (reason) => this.notEnoughQuestions = (reason == 'Not Enough Questions')
    )
  }

  submitAnswer(){
    this.activeQuiz = {...this.activeQuiz, answerSubmitted: true}
  }

  markAnswer(correctnessRating: CorrectnessRatings){
    this.activeQuiz = {...this.activeQuiz, markedAs: correctnessRating}
  }

  nextQuestion(){
    this.saveAnsweredQuestion()
    this.activeQuiz = {
      ...this.activeQuiz, 
      answerSubmitted: false, 
      answerValue: '',
      markedAs: null,
      questionNumber: this.activeQuiz.questionNumber + 1
    }
  }  

  quizComplete(){
    this.saveAnsweredQuestion()
    this.activeQuiz = null
  }

  saveAnsweredQuestion(){
    const currentQuestion = this.activeQuiz.questions[this.activeQuiz.questionNumber - 1]
    this.questionService.updateCorrectnessRating(currentQuestion, this.activeQuiz.markedAs)
  }

  render() {
    let ac = this.activeQuiz
    let currentQuestion: IQuestion =  ac ? ac.questions[ac.questionNumber - 1] : null

    return ([
      <h2>Personal Quiz</h2>,
      this.notEnoughQuestions &&
      <div id='notEnoughQuestionsError'>
        <p>
          You currently dont have enough questions to run a quiz, you need at least {this.questionsInQuiz}. Add more questions and try again.
        </p>
      </div>,

      !ac && this.tags &&
      <div id="quizSetup">
        <div class="field">
          <span class="field__name">Select tags for next quiz: </span>
          <div class="field__checkboxes field__checkboxes">
            {this.tags.map((tag: ITag) => (
              <label>
                <input 
                  type="checkbox" 
                  checked={this.quizTags.some((quizTag: ITag) => quizTag.id == tag.id)}
                  onClick={() => this.toggleQuizTag(tag)} /> { tag.value }
            </label>
          ))}
          </div>
        </div >
        <button onClick={() => this.startQuiz()}>Start Quiz</button>
      </div>,

      ac &&
        <div id="quiz">
          <h2>Question {ac.questionNumber } of { this.questionsInQuiz }</h2>
          <div class="quiz-question">{ currentQuestion.value }</div>
          <div class="field">
            <span class="field__name">Your Answer: </span><br />
            <textarea
              class={`field__text-area field__input ${ac.answerSubmitted && 'field__text-area--disabled'}`}
              onInput={event => this.answerValueChange(event)}
              value={ac.answerValue}
              readonly={ac.answerSubmitted}>
            </textarea>
          </div>
          {!ac.answerSubmitted &&
            <button onClick={() => this.submitAnswer()}> Submit</button>
          }
          {currentQuestion && ac.answerSubmitted &&
          <div>            
            <h3>The Correct Answer Is:</h3>
            <h3>{currentQuestion.correctAnswer }</h3>
            Mark the answer correct or incorrect:<br/>

            <button 
              class={ac.markedAs == 'Incorrect' ? 'selected' : ''} 
              onClick={() => this.markAnswer('Incorrect')}>
              Incorrect
            </button>
            <button 
              class={ac.markedAs == 'Kinda' ? 'selected' : ''} 
              onClick={() => this.markAnswer('Kinda')}>
              Kinda
            </button>
            <button 
              class={ac.markedAs == 'Almost' ? 'selected' : ''} 
              onClick={() => this.markAnswer('Almost')}>
              Almost
            </button>
            <button 
              class={ac.markedAs == 'Correct' ? 'selected' : ''} 
              onClick={() => this.markAnswer('Correct')}>
              Correct
            </button>
          </div>
          }
          {currentQuestion && !!ac.markedAs &&
            <button onClick={() => ac.questionNumber < ac.questions.length ? this.nextQuestion() : this.quizComplete()} >
              { ac.questionNumber < ac.questions.length ? 'Next' : 'Complete' }
            </button>
          }
        </div>
    ])
  }

}
