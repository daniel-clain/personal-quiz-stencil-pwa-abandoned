import { Component } from '@stencil/core';
import { QuestionService } from '../../classes/question-service/question.service';

@Component({
  tag: 'quiz-component',
  styleUrl: 'quiz.scss',
  shadow: true
})
export class QuizComponent {
  private questionService: QuestionService

  componentWillLoad(){
    this.questionService = QuestionService.getSingletonInstance()
    console.log(this.questionService)
  }


  render() {
    return (
      <p>
        Hello! 
      </p>
    )
  }
}
