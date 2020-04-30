import React from 'react';
import './App.css';
import { GlobalStateProvider, useGlobalDispatcher, useGlobalState } from './globalStateService';

const defineQuestionAC = question => ({
  type: 'DEFINE_QUESTION',
  question
})
const setAnswerAC = answer => ({
  type: 'SET_ANSWER',
  answer
})
const defaultState = {
  answer: 42,
  question: undefined
}

const sampleReducer = (state = defaultState, action) => {
  switch (action?.type) {
    case 'DEFINE_QUESTION':
      return {
        ...state,
        question: action.question
      }
    case 'SET_ANSWER':
      return {
        ...state,
        answer: action.answer
      }
    default:
      return state
  }
}

let questionRenderCount = 0
const questionSelector = state => state.question
const Question = () => {
  const [question] = useGlobalState(questionSelector)
  return <strong>{question} ({++questionRenderCount})</strong>
}

let answerRenderCount = 0
const Answer = () => {
  const [answer] = useGlobalState(state => state.answer) // inline selectors work too
  return <strong>{answer} ({++answerRenderCount})</strong>
}

const SolveButton = () => {
  const defineQuestion = useGlobalDispatcher(defineQuestionAC)

  return <button onClick={() => defineQuestion('What is the meaning of life, the universe, and everything?')}>What is the question?</button>
}
const RandomizeButton = () => {
  const setAnswer = useGlobalDispatcher(setAnswerAC)

  return <button onClick={() => setAnswer(Math.floor(Math.random() * 10000))}>Randomize answer</button>
}

const App = () => (
  <GlobalStateProvider rootReducer={sampleReducer}>
      <div className="outer">
        <div className="container">
          Question: <Question />
          Answer: <Answer />
          <SolveButton />
          <RandomizeButton />
        </div>
      </div>
  </GlobalStateProvider>
)

export default App;
