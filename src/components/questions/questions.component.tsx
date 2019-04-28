import { Component, State } from '@stencil/core';
import { QuestionViews } from '../../types/question-views';
import IQuestion from '../../interfaces/question.interface';
import ITag from '../../interfaces/tag.interface';
import { QuestionService } from '../../classes/question-service/question.service';
import { TagService } from '../../classes/tag-service/tag.service';

@Component({tag: 'questions-component'})
export class QuestionsComponent {

  @State() questionView: QuestionViews = 'Questions List'
  @State() questions: IQuestion[]
  @State() tags: ITag[]
  @State() newQuestion: IQuestion 
  @State() selectedQuestion: IQuestion
  questionService: QuestionService
  tagService: TagService

  
  componentWillLoad(){
    this.questionService = QuestionService.getSingletonInstance()
    this.tagService = TagService.getSingletonInstance()

    this.questions = this.questionService.questions
    this.tagService.getTags().then((tags: ITag[]) => this.tags =  tags)
    this.questionService.getQuestions().then((questions: IQuestion[]) => this.questions =  questions)

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
    console.log('new quest reset');
  }

  selectQuestion(question: IQuestion){
    this.selectedQuestion = {...question}
  }


  addQuestion(){
    if(!this.addQuestionValidation()){
      return
    }

    this.questionService.add(this.newQuestion)
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
    this.questionService.update(this.selectedQuestion)
  }

  deleteQuestion(){
    this.questionService.delete(this.selectedQuestion)
    this.selectQuestion(null)
  }


  toggleQuestionTag(tag: ITag){
    const questionHasTag: boolean = this.newQuestion.tags.some(
      (questionTag: ITag) => tag.id == questionTag.id
    )

    if(questionHasTag){
      this.newQuestion.tags.filter((questionTag: ITag) => tag.id != questionTag.id)
    } else {
      this.newQuestion.tags.push(tag)
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
                  onClick={() => this.toggleQuestionTag(tag)} 
                /> 
                {tag.name}
              </label>
            ))}
          </div>
        </div>
        <button onClick={() => this.addQuestion()}>Submit</button>

        <hr />

        <button onClick={() => this.questionView = 'Questions List'}>Questions List</button>
        <button onClick={() => this.questionView = 'Tag Management'}>Tag Management</button>

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
                          <input type="checkbox" checked={this.selectedQuestion.tags.some((questionTag: ITag) => questionTag.id == tag.id)} /> {tag.name}
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
