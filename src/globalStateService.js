import React, { useEffect, useCallback, useContext, useState } from 'react'

const identity = state => state

export const createStore = (initialState = {}) => {
    const subscriptions = new Set()
    let state = initialState

    return {
        getState: () => state,
        subscribe: callback => {
            subscriptions.add(callback)
        },
        unsubscribe: callback => {
            subscriptions.delete(callback)
        },
        mutate: mutation => {
            state = mutation(state)
            for (let callback of subscriptions) {
                callback(state)
            }
        }
    }
}

const GlobalStateContext = React.createContext(createStore())
const useGlobalStateStore = () => useContext(GlobalStateContext)

export const GlobalStateProvider = ({ store, children }) => 
    <GlobalStateContext.Provider value={store}>
        {children}
    </GlobalStateContext.Provider>

export const useGlobalState = (selector = identity) => {
    const store = useGlobalStateStore()
    const [selectedState, setSelectedState] = useState(selector(store.getState()))

    useEffect(() => {
        // TODO: deep equality check, this only triggers an update on referential inequality
        const callback = state => setSelectedState(selector(state)) 
        store.subscribe(callback)
        return () => store.unsubscribe(callback)
    }, [store, /* ignore selector */]) /* eslint-disable-line react-hooks/exhaustive-deps */

    return [selectedState, { dispatch: store.dispatch }]
}

export const useGlobalStateMutation = mutationCreator => {
    const store = useGlobalStateStore()
    return useCallback((...args) => {
        store.mutate(mutationCreator(...args))
    }, [mutationCreator, store])
}
