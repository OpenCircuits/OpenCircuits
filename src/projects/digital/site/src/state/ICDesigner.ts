// import {ICData} from "digital/models/ioobjects";

import {CreateState} from "shared/utils/CreateState";


// @TODO
const [initialState, actions, reducer] = CreateState()(
    {
        isActive: false,
        ic:       undefined as any | undefined,
    },
    {
        OpenICDesigner:  (data: any) => ({ type: "OPEN_ICDESIGNER_ID", data }) as const,
        CloseICDesigner: ()          => ({ type: "CLOSE_ICDESIGNER_ID"      }) as const,
    },
    {
        "OPEN_ICDESIGNER_ID":  (_, action) => ({ isActive: true, ic: action.data }),
        "CLOSE_ICDESIGNER_ID": (_)         => ({ isActive: false, ic: undefined }),
    }
);

export type ICDesignerState = typeof initialState;
export const { OpenICDesigner, CloseICDesigner } = actions;
export const icDesignerReducer = reducer;
