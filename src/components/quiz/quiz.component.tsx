import { Component, State } from '@stencil/core';
import { QuestionService } from '../../classes/question-service/question.service';
import ITag from '../../interfaces/tag.interface';
import IQuiz from '../../interfaces/quiz.interface';
import { CorrectnessRatings } from '../../types/correctness-rating';
import IQuestion from '../../interfaces/question.interface';
import { QuizGenertator } from '../../classes/quiz-generator/quiz-generator';
import { TagService } from '../../classes/tag-service/tag.service';

@Component({ tag: 'quiz-component' })
export class QuizComponent {
  @State() activeQuiz: IQuiz
  private questionsInQuiz: number
  private questionNumber: number
  private questionService: QuestionService
  @State() tags: ITag[]
  @State() questions: IQuestion[]
  @State() quizTags: ITag[] = []
  @State() notEnoughQuestions: boolean = false
  private quizGenerator: QuizGenertator

  componentWillLoad() {
    this.questionService = QuestionService.getSingletonInstance()
    const tagService = TagService.getSingletonInstance()
    tagService.getTags().then((tags: ITag[]) => this.tags = tags)
    this.questionService.getQuestions().then((questions: IQuestion[]) => this.questions = questions)
    console.log(this.questionService)
    this.quizGenerator = new QuizGenertator(this.questionService)
    this.questionsInQuiz = this.quizGenerator.questionsInQuiz
  }

  submitAnswer(){

  }
  toggleQuizTag(tag: ITag){
    const alreadyInTheList = this.quizTags.some((quizTag: ITag) => quizTag.id == tag.id)
    if(alreadyInTheList){
      this.quizTags.filter((quizTag: ITag) => quizTag.id != tag.id)
    } else {
      this.quizTags.push(tag)
    }

  }
  

  async startQuiz(){
    this.questionNumber = 1
    this.quizGenerator.generateQuiz()
    .then(
      (quiz: IQuiz) => this.activeQuiz = quiz,
      (reason) => this.notEnoughQuestions = (reason == 'Not Enough Questions')
    )
  }

  markAnswer(question: IQuestion, correctnessRating: CorrectnessRatings){
    this.questionService.updateCorrectnessRating(question, correctnessRating)
  }

  nextQuestion(){
    this.questionNumber ++
  }
  
  quizComplete(){
    console.log('quiz completed');

  }

  render() {
    let currentQuestion: IQuestion =  this.activeQuiz ? this.activeQuiz.questions[this.questionNumber - 1] : null

    return ([
      this.notEnoughQuestions &&
      <div id='notEnoughQuestionsError'>
        <p>
          You currently dont have enough questions to run a quiz, you need at least {this.questionsInQuiz}. Add more questions and try again.
        </p>
      </div>,

      !this.activeQuiz && this.tags &&
      <div id="quizSetup">
        <div class="field">
          <span class="field__name">Select tags for next quiz: </span>
          <div class="field__checkboxes field__checkboxes">
            {this.tags.map((tag: ITag) => (
              <label>
                <input 
                  type="checkbox" 
                  checked={this.quizTags.some((quizTag: ITag) => quizTag.id == tag.id)}
                  onClick={() => this.toggleQuizTag(tag)} /> { tag.name }
            </label>
          ))}
          </div>
        </div >
        <button onClick={() => this.startQuiz()}>Start Quiz</button>
      </div>,

      this.activeQuiz &&
        <div id="quiz">
          <h3>Question { this.questionNumber } of { this.questionsInQuiz }</h3>
          <div class="quiz-question">{ currentQuestion.value }</div>

          <form onSubmit={() => this.submitAnswer()}>
            <div class="field">
              <span class="field__name">Your Answer: </span><br />
              <textarea
                class="field__text-area field__input"
                readonly={currentQuestion.answer}>
              </textarea>
            </div>
            <button disabled={!!currentQuestion.answer}>Submit</button >
          </form >
          {currentQuestion && currentQuestion.answer && 
          <div>
            <h3>The Correct Answer Is:</h3>
            <h3>{currentQuestion.correctAnswer }</h3>
            Mark the answer correct or incorrect:<br/>
            <button onClick={() => this.markAnswer(currentQuestion, 'Correct')}>Correct</button>
            <button onClick={() => this.markAnswer(currentQuestion, 'Close')}>Close</button>
            <button onClick={() => this.markAnswer(currentQuestion, 'Kinda')}>Kinda</button>
            <button onClick={() => this.markAnswer(currentQuestion, 'Incorrect')}>Incorrect</button>
          </div>
          }
          {currentQuestion && !!currentQuestion.markedAs &&
            <button onClick={() => this.questionNumber < this.activeQuiz.questions.length ? this.nextQuestion() : this.quizComplete()} >
              { this.questionNumber < this.activeQuiz.questions.length ? 'Next' : 'Complete' }
            </button>
          }
        </div>
    ])
  }
}
