
export type ActionType = { readonly type: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionCreatorType = ((...args: any[]) => ActionType);


// Utility types to help enforce `as const` extensions for action creators in `ReadonlyActionCreators`
type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;
type ReadonlyKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
}[keyof T];

// Gets union of actual action types for A, X
type GetActions<A extends Record<string, ActionCreatorType>, X extends ActionCreatorType> =
    ReturnType<X> | { [Name in keyof A]: ReturnType<A[Name]> }[keyof A];

// Filters out any action creator that doesn't have a `readonly` `type` return property
type ReadonlyActionCreators<A extends Record<string, ActionCreatorType>> = {
    [Name in keyof A]: "type" extends Extract<"type", ReadonlyKeys<ReturnType<A[Name]>>>
        ? A[Name]
        : never
}

// Gets the union of all `type`s from all actions from A, X
type GetTypes<A extends Record<string, ActionCreatorType>, X extends ActionCreatorType> =
    ReturnType<X>["type"] | {
        [Name in keyof A]: ReturnType<A[Name]>["type"]
    }[keyof A];

// Finds action of given type `K`
type FindAction<A extends Record<string, ActionCreatorType>, X extends ActionCreatorType, K> =
    (ReturnType<X> extends {type: K} ? ReturnType<X> : never) | {
        [Name in keyof A]: (ReturnType<A[Name]>["type"] extends K ? ReturnType<A[Name]> : never)
    }[keyof A];


// X is for 'extra' actions, included from other state-instances
export function CreateState<X extends ActionCreatorType = never>() {
    // S is the implicitly defined State, and A is the set of action-creators for this state
    return function<S, A extends Record<string, ActionCreatorType>>(
        initialState: S,
        actions: ReadonlyActionCreators<A>,
        reducers: {[key in GetTypes<A,X>]?: (state: S, action: FindAction<A,X, key>) => S }) {
        return [initialState, actions, (state: S = initialState, action: GetActions<A,X>) => {
            const type = action.type;
            if (type in reducers)
                /* i cannot figure out the correct cast here  vvvv  for the life of me */
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return reducers[type as GetTypes<A,X>]!(state, action as any);
            return state;
        }] as const;
    }
}
