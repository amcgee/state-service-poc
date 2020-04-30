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

export const GlobalStateProvider = ({ reducer, children }) => {
    const stateStore = useMemo(() => new StateStore(reducer), [/* ignore reducer */]) /* eslint-disable-line react-hooks/exhaustive-deps */

    return <GlobalStateContext.Provider value={stateStore}>
        {children}
    </GlobalStateContext.Provider>
}

export const useGlobalState = (selector = identity) => {
    const context = useContext(GlobalStateContext)
    const [selectedState, setSelectedState] = useState(selector(context.state))

    useEffect(() => {
        // TODO: deep equality check, this only triggers an update on referential inequality
        const callback = state => setSelectedState(selector(state))
        
        context.subscribe(callback)
        return () => context.unsubscribe(callback)
    }, [context, selectedState, /* ignore selector */]) /* eslint-disable-line react-hooks/exhaustive-deps */

    return [selectedState, { dispatch: context.dispatch }]
}

export const useGlobalDispatch = () => {
    return useContext(GlobalStateContext).dispatch
}

export const useGlobalAction = (actionCreator) => {
    const dispatch = useGlobalDispatch()
    return useCallback((...args) => {
        dispatch(actionCreator(...args))
    }, [actionCreator, dispatch])
}