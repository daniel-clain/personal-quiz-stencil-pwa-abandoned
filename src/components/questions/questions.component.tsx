import { Component, State } from '@stencil/core';
import { QuestionViews } from '../../types/question-views';
import IQuestion from '../../interfaces/question.interface';
import ITag from '../../interfaces/tag.interface';
import { QuestionService } from "../../classes/question-service/question.service";
import DataService from '../../classes/data-service/data.service';

@Component({tag: 'questions-component'})
export class QuestionsComponent {

  @State() questionView: QuestionViews = 'Questions List'
  @State() questions: IQuestion[]
  @State() tags: ITag[]
  @State() newQuestion: IQuestion 
  @State() selectedQuestion: IQuestion
  questionService: QuestionService
  dataService: DataService

  
  componentWillLoad(){
    this.questionService = QuestionService.getSingletonInstance()
    this.dataService = DataService.getSingletonInstance()

    this.dataService.tags$.subscribe((tags: ITag[]) => {
      console.log('tag service subscribe tags', tags);
      this.tags = [...tags]
    })
    this.dataService.questions$.subscribe((questions: IQuestion[]) => this.questions = [...questions])

    this.resetNewQuestion()
  }  

  resetNewQuestion(){
    this.newQuestion = {
      id: null,
      value: '',
      dateLastAsked: null,
      dateLastUpdated: null,
      correctAnswer: '',
      correctnessRating: null,
      tags: []
    }
  }

  selectQuestion(question: IQuestion){
    this.selectedQuestion = {...question}
  }


  addQuestion(){
    if(!this.addQuestionValidation()){
      return
    }

    this.dataService.add(this.newQuestion, 'Questions')
    this.resetNewQuestion()
  }

  addQuestionValidation(): boolean{
    
    if(!this.newQuestion.value || this.newQuestion.value == ''){
      console.log('can not submit new question because value is empty');
      return
    }
    if(!this.newQuestion.correctAnswer || this.newQuestion.correctAnswer == ''){
      console.log('can not submit new question because correct answer is empty');
      return
    }
    return true
  }
  
  selectedQestionValueChange(event){
    this.selectedQuestion.value =  event.path[0].value
  }

  updateQuestion(){
    this.dataService.update(this.selectedQuestion, 'Questions')
    this.selectQuestion(null)
  }

  deleteQuestion(){
    this.dataService.delete(this.selectedQuestion, 'Questions')
    this.selectQuestion(null)
  }

  toggleQuestionTag(tag: ITag, type: string){
    const questionHasTag: boolean = this[type+'Question'].tags.some(
      (questionTag: ITag) => tag.id == questionTag.id
    )

    if(questionHasTag){
      this[type+'Question'].tags = this[type+'Question'].tags.filter((questionTag: ITag) => tag.id != questionTag.id)
    } else {
      this[type+'Question'].tags.push(tag)
    }
  }

  questionValueInputHandler(event){
    this.newQuestion.value = event.path[0].value
  }

  questionCorrectAnswerInputHandler(event){
    this.newQuestion.correctAnswer = event.path[0].value
  }


  render() {
    return (
      this.tags &&
      <div class='question-management'>
        <h3>Add Question</h3>        
        <div class="field">
          <span class="field__name">Question: </span>
          <input class="field__input" value={this.newQuestion.value} onInput={event => this.questionValueInputHandler(event)} />
        </div>
        <div class="field">
          <span class="field__name">Correct Answer: </span>
          <textarea class="field__text-area field__input" value={this.newQuestion.correctAnswer} onInput={event => this.questionCorrectAnswerInputHandler(event)}></textarea>
        </div>
        <div class="field">
          <span class="field__name">Tags: </span>
          <div class="field__checkboxes">
            {this.tags.map((tag: ITag) => (              
              <label>
                <input 
                  type="checkbox" 
                  checked={this.newQuestion.tags.some((questionTag: ITag) => questionTag.id == tag.id)}
                  onClick={() => this.toggleQuestionTag(tag, 'new')} 
                /> 
                {tag.value}
              </label>
            ))}
          </div>
        </div>
        <button onClick={() => this.addQuestion()}>Submit</button>

        <hr />
        <button 
          class={this.questionView == 'Questions List' ? 'selected' : ''} 
          onClick={() => this.questionView = 'Questions List'}>
          Questions List
        </button>
        <button 
          class={this.questionView == 'Tag Management' ? 'selected' : ''} 
          onClick={() => this.questionView = 'Tag Management'}>
          Tag Management
        </button>

        {this.questionView == 'Questions List' && this.questions && 
          <div class="list">
            <h2>Questions List</h2>
            {this.questions.map((question: IQuestion) => ([
            (!this.selectedQuestion || this.selectedQuestion.id != question.id) &&
            <div class="list__item" onClick={() => this.selectQuestion(question)}>
              {question.value}
            </div>,
            this.selectedQuestion && this.selectedQuestion.id == question.id &&
            <div class="list__item--expanded">
              <hr/>
                <h3>Edit Question: {question.value}</h3>
                <div class="field">
                  <span class="field__name">Question: </span>
                  <input class="field__input" value={this.selectedQuestion.value} onInput={event => this.selectedQestionValueChange(event)}/>
                </div>
                <div class="field">
                  <span class="field__name">Correct Answer: </span>
                  <textarea class="field__text-area field__input" >{this.selectedQuestion.correctAnswer}</textarea>
                </div>
                <div class="field">
                  <span class="field__name">Tags: </span>
                  <div class="field__checkboxes">
                    {this.tags ?
                      this.tags.map((tag: ITag) => 
                        <label>
                          <input type="checkbox" 
                          checked={this.selectedQuestion.tags.some((questionTag: ITag) => questionTag.id == tag.id)}
                          onClick={() => this.toggleQuestionTag(tag, 'selected')} /> {tag.value}
                        </label>
                      )
                      :
                      <label>
                        Got to 'Tag Management' to create tags...
                      </label>
                    }                    
                  </div>
                </div>
                <button onClick={() => this.updateQuestion()}>Update</button>
                <button onClick={() => this.selectQuestion(null)}>Close</button>
                <button onClick={() => this.deleteQuestion()}>Delete</button>
                <hr />
            </div>
            ]))}
          </div>
        }
        {this.questionView == 'Tag Management' && 
          <tags-component></tags-component>
        }
      </div>
    );
  }
}
