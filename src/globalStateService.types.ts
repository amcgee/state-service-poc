export type SynchronousMutation<StateType> = (state: StateType) => StateType
export type AsynchronousMutation<StateType> =  Promise<SynchronousMutation<StateType>>
export type SingularMutation<StateType> = SynchronousMutation<StateType> | AsynchronousMutation<StateType>
export type ParallelMutations<StateType> = Array<Mutation<StateType>>
export type Mutation<StateType> = SingularMutation<StateType> | ParallelMutations<StateType>


export type MutationCreator<StateType, Args extends any[]> = (...args: Args) => Mutation<StateType>

export type Selector<StateType, OutputType> = (state: StateType) => OutputType

export interface GlobalStateStore<StateType> {
    getState: () => StateType
    subscribe: (callback: Function) => void
    unsubscribe: (callback: Function) => void
    mutate: (mutation: Mutation<StateType>) => Promise<StateType>
}

export type GlobalStateProviderProps<StateType> = {
    store: GlobalStateStore<StateType>,
    children: React.ReactNode
}