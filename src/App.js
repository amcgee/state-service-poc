import React from 'react';
import './App.css';
import { GlobalStateProvider, createStore, useGlobalState, useGlobalStateMutation } from './globalStateService';

// Action-reducers (mutations?)
const setAnswerMutation = answer => state => ({ ...state, answer })
const setQuestionMutation = question => state => ({ ...state, question })

// Store
const store = createStore({
  answer: 42
})

// Consumer Components
let questionRenderCount = 0
const questionSelector = state => state.question
const Question = () => {
  const [question] = useGlobalState(questionSelector)
  return <span>
    <strong>{question}</strong>
    <small>({++questionRenderCount})</small>
  </span>
}

let answerRenderCount = 0
const Answer = () => {
  const [answer] = useGlobalState(state => state.answer) // inline selectors work too
  return <span>
    <strong>{answer}</strong>
    <small>({++answerRenderCount})</small>
  </span>
}

const SolveButton = () => {
  const defineQuestion = useGlobalStateMutation(setQuestionMutation)

  return <button onClick={() => defineQuestion('What is the meaning of life, the universe, and everything?')}>What is the question?</button>
}
const RandomizeButton = () => {
  const setAnswer = useGlobalStateMutation(setAnswerMutation)

  return <button onClick={() => setAnswer(Math.floor(Math.random() * 10000))}>Randomize answer</button>
}

// Top-level application
const App = () => (
  <GlobalStateProvider store={store}>
    <div className="outer">
      <div className="container">
        Question: <Question />
          Answer: <Answer />
        <SolveButton />
        <RandomizeButton />
      </div>
      <p>
        <strong>Notes</strong><br/>
          Numbers in parenthesis are component render counts.<br/>
          {process.env.NODE_ENV !== 'production' && <>
            In debug builds (<em>yarn start</em>) <a href="https://github.com/facebook/react/issues/15074#issuecomment-471197572" target="_blank" rel="noopener noreferrer">React will double-render any component using Hooks by design</a>.<br/>
            Running the app in production (<em>yarn build &amp;&amp; npx serve build</em>) will show the correct render counts
          </>}
      </p>

    </div>
  </GlobalStateProvider>
)

export default App;
