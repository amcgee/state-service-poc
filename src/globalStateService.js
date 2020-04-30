import React, { useMemo, useEffect, useCallback, useContext, useState } from 'react'

const identity = state => state

class StateStore {
    state = undefined
    subscriptions = new Set()
    reducer

    constructor(reducer = identity) {
        this.reducer = reducer
        this.state = reducer(undefined, undefined)
    }

    subscribe = (callback) => {
        this.subscriptions.add(callback)
    }
    unsubscribe = (callback) => {
        this.subscriptions.delete(callback)
    }
    dispatch = (action) => {
        this.state = this.reducer(this.state, action)
        for (let callback of this.subscriptions) {
            callback(this.state)
        }
    }
}

const GlobalStateContext = React.createContext(new StateStore())

export const GlobalStateProvider = ({ rootReducer, children }) => {
    const stateStore = useMemo(() => new StateStore(rootReducer), [rootReducer])

    return <GlobalStateContext.Provider value={stateStore}>
        {children}
    </GlobalStateContext.Provider>
}

export const useGlobalState = (selector = identity) => {
    const context = useContext(GlobalStateContext)
    const [selectedState, setSelectedState] = useState(selector(context.state))

    const stableSelector = useCallback(selector, [ /* ignore selector updates */ ]) /* eslint-disable-line react-hooks/exhaustive-deps */

    useEffect(() => {
        // TODO: deep equality check, this only triggers an update on referential inequality
        const callback = state => setSelectedState(stableSelector(state))
        
        context.subscribe(callback)
        return () => context.unsubscribe(callback)
    }, [context, stableSelector, selectedState])

    return [selectedState, { dispatch: context.dispatch }]
}

export const useGlobalDispatch = () => {
    return useContext(GlobalStateContext).dispatch
}

export const useGlobalDispatcher = (actionCreator) => {
    const dispatch = useGlobalDispatch()
    return useCallback((...args) => {
        dispatch(actionCreator(...args))
    }, [actionCreator, dispatch])
}