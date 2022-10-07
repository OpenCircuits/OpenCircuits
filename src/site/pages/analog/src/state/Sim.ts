import {SimDataMappings} from "analog/models/sim/NetlistGenerator";

import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        hasData:     false,
        hasMappings: false,
        mappings:    undefined as SimDataMappings | undefined,
    },
    {
        SetHasData:     (hasData: boolean)       => ({ type: "SET_HAS_DATA_SIM_ID", hasData }) as const,
        SetSimMappings: (data?: SimDataMappings) => ({ type: "SET_SIM_MAPPINGS_ID", data    }) as const,
    },
    {
        "SET_HAS_DATA_SIM_ID": (state, action) => ({ ...state, hasData: action.hasData }),
        "SET_SIM_MAPPINGS_ID": (state, action) => ({ ...state, mappings: action.data, hasMappings: !!action.data }),
    }
);

export type SimState = typeof initialState;
export const { SetHasData, SetSimMappings } = actions;
export const simStateReducer = reducer;
