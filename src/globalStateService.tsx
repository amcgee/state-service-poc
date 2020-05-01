import React, { useEffect, useCallback, useContext, useState } from 'react'
import type { GlobalStateStore, MutationCreator, Selector, GlobalStateProviderProps, Mutation } from './globalStateService.types'
import { debounce } from './debounce'

const identity = (state: any) => state

export const createStore = <StateType extends {}>(initialState: StateType): GlobalStateStore<StateType> => {
    const subscriptions = new Set<Function>()
    let state = initialState

    const notifySubscribers = debounce(() => {
        for (let callback of subscriptions) {
            callback(state)
        }
    }, 10)

    const applyMutation = async (mutation: Mutation<StateType>) => {
        if (Array.isArray(mutation)) {
            for (let i = 0; i < mutation.length; ++i) {
                await applyMutation(mutation[i])
            }
            return
        }
        const mutate = await mutation
        if (typeof mutate !== 'function') {
            console.warn(`Mutations must be a function or promise, received ${typeof mutate}`)
            return
        }
        
        state = mutate(state)
        notifySubscribers()
    }

    return {
        getState: () => state,
        subscribe: callback => {
            subscriptions.add(callback)
        },
        unsubscribe: callback => {
            subscriptions.delete(callback)
        },
        mutate: async (mutation: Mutation<StateType>) => {
            await applyMutation(mutation)
            return state
        }
    }
}

const GlobalStateContext = React.createContext<GlobalStateStore<any>>(createStore({}))
const useGlobalStateStore = <StateType extends any = object>() => useContext(GlobalStateContext) as GlobalStateStore<StateType>

export const GlobalStateProvider = <StateType extends any>({ store, children }: GlobalStateProviderProps<StateType>) => 
    <GlobalStateContext.Provider value={store}>
        {children}
    </GlobalStateContext.Provider>

export const useGlobalState = <StateType extends any, OutputType>(selector: Selector<StateType, OutputType> = identity): OutputType => {
    const store = useGlobalStateStore<StateType>()
    const [selectedState, setSelectedState] = useState<OutputType>(selector(store.getState()))

    useEffect(() => {
        // TODO: deep equality check, this only triggers an update on referential inequality
        const callback = (state: StateType) => setSelectedState(selector(state)) 
        store.subscribe(callback)
        return () => store.unsubscribe(callback)
    }, [store, /* ignore selector */]) /* eslint-disable-line react-hooks/exhaustive-deps */

    return selectedState
}

export const useGlobalStateMutation = <StateType, Args extends Array<any>>(mutationCreator: MutationCreator<StateType, Args>): ((...args: Args) => void) => {
    const store = useGlobalStateStore<StateType>()
    return useCallback((...args) => {
        store.mutate(mutationCreator(...args))
    }, [mutationCreator, store])
}
