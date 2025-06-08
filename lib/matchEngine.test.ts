import { matchStudentResponse, formatMatchResults } from './matchEngine'
import { Rubric } from './types/matching'

// Example rubric for testing
const sampleRubric: Rubric = {
  id: 'test-1',
  title: 'Physics Problem Set 1',
  criteria: [
    {
      code: 'P1',
      type: 'math',
      steps: [
        {
          expected: 9.81,
          tolerance: '5%',
          unit: 'm/s²',
          isFinalStep: true,
          description: 'Correctly calculated gravitational acceleration'
        }
      ]
    },
    {
      code: 'P2',
      type: 'written',
      writtenFeedback: {
        successComment: "Good explanation of Newton's laws of motion",
        improvementComment: 'Please include key concepts about force and motion',
        keywords: ['force', 'mass', 'acceleration', 'newton', 'law']
      }
    }
  ]
}

// Example usage
console.log('Testing Math Response:')
const mathResponse = 'The acceleration due to gravity is 9.8 m/s2'
console.log(formatMatchResults(matchStudentResponse(mathResponse, sampleRubric)))

console.log('\nTesting Written Response:')
const writtenResponse = "Newton's laws describe how forces affect the motion and acceleration of objects with mass."
console.log(formatMatchResults(matchStudentResponse(writtenResponse, sampleRubric)))

console.log('\nTesting Incorrect Response:')
const incorrectResponse = 'The speed is 5 kilometers per hour'
console.log(formatMatchResults(matchStudentResponse(incorrectResponse, sampleRubric))) 