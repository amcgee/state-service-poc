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
  <GlobalStateProvider reducer={sampleReducer}>
    <div className="outer">
      <div className="container">
        Question: <Question />
          Answer: <Answer />
        <SolveButton />
        <RandomizeButton />
      </div>
      <p>
        <strong>Note</strong><br/>
          In Debug mode (<em>yarn start</em>) React <a href="https://github.com/facebook/react/issues/15074#issuecomment-471197572" target="_blank">will double-render any component using Hooks by design</a>.<br/>
          Running the sample app in production (<em>yarn build &amp;&amp; npx serve build</em>) will show the correct render counter values
      </p>

    </div>
  </GlobalStateProvider>
)

export default App;
