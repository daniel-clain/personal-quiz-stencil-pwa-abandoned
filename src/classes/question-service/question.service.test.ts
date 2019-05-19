
import { QuestionService } from "./question.service";
import IQuestion from "../../global/interfaces/question.interface";

import IInMemoryData from '../../global/interfaces/in-memory-data.interface';
import { DataService } from '../data-service/data.service';

class DataServiceMock extends DataService{
  inMemory: IInMemoryData  = {
    'Questions': [
      {
        id: null,
        value: 'mock question',
        correctAnswer: null,
        correctnessRating: null,
        dateLastAsked: null,
        dateLastUpdated: null,
        tags: []
      }
    ],
    'Tags': []
  }
}

const mockDataServiceInstance: DataServiceMock =  new DataServiceMock(null, null, null, null)

describe('getQuestionsByTag()', () => {
  it('should return stub questions from mock data service and not real data service', async () => {
    const testInstance = new QuestionService(mockDataServiceInstance)
    const returnedQuestions: IQuestion[] = await testInstance.getQuestionsByTag()
    expect(returnedQuestions).not.toBe(undefined)
    expect(returnedQuestions[0].value).not.toBe('x')
    expect(returnedQuestions[0].value).toBe('mock question')
  });
});




/* xdescribe ('getQuestionsByTag', () => {
  
  describe ('test 2 questions where each one has a tag that matches one of the 2 argument tags', () => {    

    test('should return both questions', () => {      
      const argumentTags: ITag[] = [
        {
          id: 'matching tag1',
          name: 'x'
        },
        {
          id: 'matching tag2',
          name: 'x'
        }
      ]
      const stubQuestions = [
        {
          id: 'ques1',
          tags: [
            {
              id: 'matching tag1',
            },        
            {
              id: 'non matching tag',
            }
          ]
        },
        {
          id: 'ques2',
          tags: [
            {
              id: 'matching tag2',
            },        
            {
              id: 'non matching tag',
            }
          ]
        }
      ]

      const testInstance = new QuestionService(mockDataService)
      const resultQuestions: IQuestion[] = testInstance.getQuestionsByTag(argumentTags)
      expect(resultQuestions.every(resultQuestion => stubQuestions.some(stubQuestion => stubQuestion.id == resultQuestion.id)))
      expect(resultQuestions.length).toBe(2)
      
    })
    
  });
  

  describe ('test 2 questions where only one has a tag that matches one of the 2 argument tags', () => {   
    test('should return both questions', () => {      
      const argumentTags: ITag[] = [
        {
          id: 'matching tag1',
          name: 'x'
        },
        {
          id: 'matching tag2',
          name: 'x'
        }
      ]
      const stubQuestions = [
        {
          id: 'ques1',
          tags: [
            {
              id: 'matching tag1',
            },        
            {
              id: 'non matching tag',
            }
          ]
        },
        {
          id: 'ques2',
          tags: [
            {
              id: 'non matching tag',
            },        
            {
              id: 'non matching tag',
            }
          ]
        }
      ] 
      
      const testInstance = new QuestionService(mockDataService)
      const resultQuestions: IQuestion[] = testInstance.getQuestionsByTag(argumentTags)
      expect(resultQuestions.every(resultQuestion => stubQuestions.some(stubQuestion => stubQuestion.id == resultQuestion.id)))
      expect(resultQuestions.length).toBe(1)      
    })    
  }) 




});*/