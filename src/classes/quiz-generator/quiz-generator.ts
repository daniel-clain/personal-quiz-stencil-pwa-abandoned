import IQuiz from "../../interfaces/quiz.interface";
import { QuestionService } from "../question-service/question.service";
import IQuestion from "../../interfaces/question.interface";
import ITag from "../../interfaces/tag.interface";
import IQuestionWithRating from "../../interfaces/questionWithRating";
import IQuestionWithRandomValue from "../../interfaces/questionWithRandomValue";
import shuffle from "../../helper-functions/shuffle";
import random from "../../helper-functions/random";

export class QuizGenertator{

  private questionsInQuiz = 10
  
  constructor(private questionService: QuestionService){}

  public generateQuiz(quizTags?: ITag[]): IQuiz {
    const tagFilteredQuestions: IQuestion[] = this.questionService.getQuestionsByTag(quizTags)
    return {
      questions: this.choseQuizQuestions(tagFilteredQuestions)
    }
  }

  private choseQuizQuestions(tagFilteredQuestions: IQuestion[]): IQuestion[]{
    const questionsWithRating: IQuestionWithRating[] =  this.rateQuestions(tagFilteredQuestions)
    const questionsWithRandomValue: IQuestionWithRandomValue[] =  this.assignQuestionsRandomValue(questionsWithRating)
    const quizQuestions: IQuestion[] = shuffle(questionsWithRandomValue)
    .sort((a, b) => a.randomValue - b.randomValue)
    .slice(0, this.questionsInQuiz)
    .map((questionsWithRandomValue: IQuestionWithRandomValue): IQuestion => {
      const {randomValue, ...question} = questionsWithRandomValue
      return question
    })
    return quizQuestions
  }

  // rating is based on question correctness and how long since last asked relative to other questions
  private rateQuestions(questions: IQuestion[]): IQuestionWithRating[]{
    const {mostRecentDate, lastAskedDaysRange} = this.getLaskAskedDaysRange(questions)
    return questions.map((question: IQuestion) => {
      const lastAskedRating: number = this.getLastAskedRating(mostRecentDate, question.dateLastAsked, lastAskedDaysRange)
      return {...question, rating: ((question.correctnessRating + lastAskedRating) / 2)}
    })
  }
  
  // questions are rated relative to time scale of total questions
  private getLaskAskedDaysRange(questions: IQuestion[]): any{
    const datesArray = questions.map(question => question.dateLastAsked)
    const sortedDates = datesArray.sort()
    const longestAgo = sortedDates[0]
    const mostRecentDate = sortedDates[sortedDates.length - 1]
    const diffTime = Math.abs(mostRecentDate.getTime() - longestAgo.getTime());
    const lastAskedDaysRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return {mostRecentDate, lastAskedDaysRange}
  }

  // the longer its been since a question has been asked, the lower its rating should be
  private getLastAskedRating(mostRecent: Date, questionDate: Date, dayRange: number): number{
    if(dayRange == 0)
      return 10
    const diffTime = Math.abs(mostRecent.getTime() - questionDate.getTime());
    const lastAskedDaysSinceMostRecent = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if(lastAskedDaysSinceMostRecent == 0)
      return 10
    return Math.round(10 - lastAskedDaysSinceMostRecent/dayRange*10)
  }

  // random value based on question rating
  private assignQuestionsRandomValue(questionsWithRating: IQuestionWithRating[]): IQuestionWithRandomValue[]{
    return questionsWithRating.map((questionWithRating: IQuestionWithRating): IQuestionWithRandomValue => {
      const {rating, ...question} = questionWithRating
      const rand = random()
      const randomValue: number = Math.round(rating * rand) as number
      const questionWithRandomValue: IQuestionWithRandomValue = {...question, randomValue}
      return questionWithRandomValue
    })
  }

}