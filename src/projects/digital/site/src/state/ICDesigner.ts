import {GUID} from "shared/api/circuit/public";

import {CreateState} from "shared/site/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isActive: false,
        objIds:   [] as GUID[] | undefined,
    },
    {
        OpenICDesigner:  (ids: GUID[]) => ({ type: "OPEN_ICDESIGNER_ID", ids }) as const,
        CloseICDesigner: ()            => ({ type: "CLOSE_ICDESIGNER_ID"     }) as const,
    },
    {
        "OPEN_ICDESIGNER_ID":  (_, action) => ({ isActive: true,  objIds: action.ids }),
        "CLOSE_ICDESIGNER_ID": (_)         => ({ isActive: false, objIds: undefined  }),
    }
);

export type ICDesignerState = typeof initialState;
export const { OpenICDesigner, CloseICDesigner } = actions;
export const icDesignerReducer = reducer;
