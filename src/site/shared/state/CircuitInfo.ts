import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        id:       "",
        name:     "",
        isSaved:  true,
        isLocked: false,

        loading: false,
        saving:  false,
        error:   "",
    },
    {
        // TODO: make factory methods for trivial action types when TS4.4 gets adopted
        //  to use pattern template literals as index signatures https://github.com/microsoft/TypeScript/pull/44512
        ToggleCircuitLocked:     ()                 => ({ type: "TOGGLE_CIRCUIT_LOCKED_ID"            }) as const,
        SetCircuitId:            (id: string)       => ({ type: "SET_CIRCUIT_ID_ID",            id    }) as const,
        SetCircuitName:          (name: string)     => ({ type: "SET_CIRCUIT_NAME_ID",          name  }) as const,
        SetCircuitSaved:         (saved: boolean)   => ({ type: "SET_CIRCUIT_SAVED_ID",         saved }) as const,
        _SetCircuitLoading:      (loading: boolean) => ({ type: "SET_CIRCUIT_LOADING_ID",     loading }) as const,
        _SetCircuitSavingStart:  ()                 => ({ type: "SET_CIRCUIT_SAVING_START_ID"         }) as const,
        _SetCircuitSavingFinish: (err?: string)     => ({ type: "SET_CIRCUIT_SAVING_FINISH_ID", err   }) as const,
    },
    {
        "TOGGLE_CIRCUIT_LOCKED_ID":     (state)         => ({ ...state, isLocked: !state.isLocked }),
        "SET_CIRCUIT_ID_ID":            (state, action) => ({ ...state, id: action.id }),
        "SET_CIRCUIT_NAME_ID":          (state, action) => ({ ...state, name: action.name }),
        "SET_CIRCUIT_SAVED_ID":         (state, action) => ({ ...state, isSaved: action.saved }),
        "SET_CIRCUIT_LOADING_ID":       (state, action) => ({ ...state, loading: action.loading }),
        "SET_CIRCUIT_SAVING_START_ID":  (state)         => ({ ...state, saving: true, error: "" }),
        "SET_CIRCUIT_SAVING_FINISH_ID": (state, action) => ({
            ...state,
            saving:  false,
            isSaved: (action.err === undefined),
            error:   action.err ?? "",
        }),
    }
);


export type CircuitInfoState = typeof initialState;
export const { ToggleCircuitLocked, SetCircuitId, SetCircuitName,
              SetCircuitSaved, _SetCircuitLoading,
              _SetCircuitSavingStart, _SetCircuitSavingFinish } = actions;
export const circuitInfoReducer = reducer;
