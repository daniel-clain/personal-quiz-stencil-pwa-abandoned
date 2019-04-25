import { Component, State } from '@stencil/core';
import { QuestionViews } from '../../types/question-views';
import IQuestion from '../../interfaces/question.interface';
import ITag from '../../interfaces/tag.interface';

@Component({tag: 'questions-component'})
export class QuestionsComponent {

  @State() questionView: QuestionViews = 'Questions List'
  @State() questions: IQuestion[]
  @State() tags: ITag[]
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
            <label>
              <input type="checkbox" /> tag.value
             </label>
          </div>
        </div>
        <button>Submit</button>

        <hr />

        <button onClick={() => this.questionView = 'Questions List'}>Questions List</button>
        <button onClick={() => this.questionView = 'Tag Management'}>Tag Management</button>
        {this.questionView == 'Questions List' &&
          <div class="list">
            <h2>Questions List</h2>
            <div>
              <div class="list__item">
                question.value
              </div>
              <div class="list__item--expanded">
                <hr/>
                  <h3>Edit Question: selectedQuestion.value</h3>
                  <div class="field">
                    <span class="field__name">Question: </span>
                    <input class="field__input" />
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
                  <button>Update</button>
                  <button type="button">Close</button>
                  <button>Delete</button>
                  <hr />
              </div>
            </div>
          </div>
        }
        {this.questionView == 'Tag Management' && 
          <tags-component></tags-component>
        }
      </div>
    );
  }
}
