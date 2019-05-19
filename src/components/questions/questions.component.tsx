import { Component, State, Prop } from '@stencil/core';
import { QuestionViews } from '../../global/types/question-views';
import IQuestion from '../../global/interfaces/question.interface';
import ITag from '../../global/interfaces/tag.interface';
import { DataService } from '../../classes/data-service/data.service';

@Component({tag: 'questions-component'})
export class QuestionsComponent {
  @Prop() dataService: DataService
  @State() questionView: QuestionViews = 'Questions List'
  @State() questions: IQuestion[]
  @State() tags: ITag[]
  @State() newQuestion: IQuestion 
  @State() selectedQuestion: IQuestion
  
  componentWillLoad(){
    this.dataService.tags$.subscribe((tags: ITag[]) => this.tags = [...tags])
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
    if(!this.questionValidation()) return
    
    this.dataService.add<IQuestion>(this.newQuestion, 'Questions')
    this.resetNewQuestion()
  }

  questionValidation(): boolean{
    
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
  selectedQestionAnswerChange(event){
    this.selectedQuestion.correctAnswer =  event.path[0].value
  }

  updateQuestion(){    
    if(!this.questionValidation()) return
    this.dataService.update(this.selectedQuestion, 'Questions')
    this.selectQuestion(null)
  }

  deleteQuestion(){    
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete question: \n\n ${this.selectedQuestion.value}`)
    if(deleteConfirmed){
      this.dataService.delete(this.selectedQuestion, 'Questions')
      this.selectQuestion(null)
    }
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
      <div class="add-question">
          <h2>Add Question</h2>        
          <div class="field add-question__value">
            <span class="field__name">Question: </span>
            <input class="field__input" value={this.newQuestion.value} onInput={event => this.questionValueInputHandler(event)} />
          </div>
          <div class="field add-question__answer">
            <span class="field__name">Correct Answer: </span>
            <textarea class="field__text-area field__input" value={this.newQuestion.correctAnswer} onInput={event => this.questionCorrectAnswerInputHandler(event)}></textarea>
          </div>
          <div class="field add-question__tags">
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
        </div>

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
          <div class="questions-list">
            <h2>Questions List</h2>
            {this.questions.map((question: IQuestion) => ([
            (!this.selectedQuestion || this.selectedQuestion.id != question.id) &&
            <div class="list__item" onClick={() => this.selectQuestion(question)}>
              {question.value}
            </div>,
            this.selectedQuestion && this.selectedQuestion.id == question.id &&
            <div class="list__item--expanded">
              <hr/>
                <h2>Edit Question: {question.value}</h2>
                <div class="field">
                  <span class="field__name">Question: </span>
                  <input 
                    class="field__input" 
                    value={this.selectedQuestion.value} 
                    onInput={event => this.selectedQestionValueChange(event)}
                  />
                </div>
                <div class="field">
                  <span class="field__name">Correct Answer: </span>
                  <textarea 
                    class="field__text-area field__input"
                    onInput={event => this.selectedQestionAnswerChange(event)}
                  >
                    {this.selectedQuestion.correctAnswer}
                  </textarea>
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
          <tags-component dataService={this.dataService}></tags-component>
        }
      </div>
    );
  }
}
