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
  questionService: QuestionService
  tagService: TagService
  selectedQuestion: IQuestion

  
  componentWillLoad(){
    this.questionService = QuestionService.getSingletonInstance()
    this.tagService = TagService.getSingletonInstance()

    this.questionService.questions$.subscribe(
      (questions: IQuestion[]) => this.questions = questions
    )
    this.tagService.tags$.subscribe(
      (tags: ITag[]) => this.tags = tags
    )

    this.resetNewQuestion()

  }  

  resetNewQuestion(){
    this.newQuestion = {
      id: null,
      value: null,
      dateLastAsked: null,
      dateLastUpdated: null,
      correctAnswer: null,
      correctnessRating: null,
      tags: []
    }
  }

  selectQuestion(question: IQuestion){
    this.selectedQuestion = question
  }

  addQuestion(){
    if(!this.newQuestion.value || this.newQuestion.value == ''){
      console.log('can not submit new question because value is empty');
      return
    }
    this.questionService.add(this.newQuestion)
    this.resetNewQuestion()
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


  render() {
    return (
      <div class='question-management'>
        <h3>Add Question</h3>        
        <div class="field">
          <span class="field__name">Question: </span>
          <input class="field__input" />
        </div>
        <div class="field">
          <span class="field__name">Correct Answer: </span>
          <textarea class="field__text-area field__input"></textarea>
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

        {this.questionView == 'Questions List' &&
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
                  <input class="field__input" onInput={event => this.selectedQestionValueChange(event)}/>
                </div>
                <div class="field">
                  <span class="field__name">Correct Answer: </span>
                  <textarea class="field__text-area field__input" ></textarea>
                </div>
                <div class="field">
                  <span class="field__name">Tags: </span>
                  <div class="field__checkboxes">
                    {this.tags ?
                      this.tags.map((tag: ITag) => 
                        <label>
                          <input type="checkbox" /> {tag.name}
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
