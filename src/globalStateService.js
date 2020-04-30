import React, { useMemo, useEffect, useCallback, useContext, useState } from 'react'

const GlobalStateContext = React.createContext({
    state: undefined,
    dispatch: () => undefined
})

export const GlobalStateProvider = ({ rootReducer, children }) => {
    const subscriptions = useMemo(() => new Set(), [])

    const subscribe = useCallback(callback => {
        subscriptions.add(callback)
    }, [subscriptions])
    const unsubscribe = useCallback(callback => {
        subscriptions.delete(callback)
    }, [subscriptions])
    
    const dispatch = useCallback(action => {
        stateContext.state = rootReducer(stateContext.state, action)
        for (let callback of subscriptions) {
            callback(stateContext.state)
        }
    }, [rootReducer, subscriptions, /* ignore stateContext.state updates */]) /* eslint-disable-line react-hooks/exhaustive-deps */
    
    const stateContext = useMemo(() => ({
        state: rootReducer(undefined, undefined),
        dispatch,
        subscribe,
        unsubscribe
    }), [rootReducer, dispatch, subscribe, unsubscribe])

    return <GlobalStateContext.Provider value={stateContext}>
        {children}
    </GlobalStateContext.Provider>
}

const identitySelector = state => state // By default, respond to ANY state change
export const useGlobalState = (selector = identitySelector) => {
    const context = useContext(GlobalStateContext)
    const [selectedState, setSelectedState] = useState(selector(context.state))

    const stableSelector = useCallback(selector, [ /* ignore selector updates */ ]) /* eslint-disable-line react-hooks/exhaustive-deps */

    useEffect(() => {
        const callback = state => {
            // TODO: deep equality check, this only triggers an update on referential inequality
            setSelectedState(
                stableSelector(state)
            )
        }
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