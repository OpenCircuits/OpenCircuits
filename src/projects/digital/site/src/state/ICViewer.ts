import {GUID} from "shared/api/circuit/schema";

import {CreateState} from "shared/site/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isActive: false,
        icId:     undefined as GUID | undefined,
    },
    {
        OpenICViewer:  (id: GUID) => ({ type: "OPEN_ICVIEWER_ID", id }) as const,
        CloseICViewer: ()         => ({ type: "CLOSE_ICVIEWER_ID"      }) as const,
    },
    {
        "OPEN_ICVIEWER_ID":  (_, action) => ({ isActive: true,  icId: action.id }),
        "CLOSE_ICVIEWER_ID": (_)         => ({ isActive: false, icId: undefined }),
    }
);

export type ICViewerState = typeof initialState;
export const { OpenICViewer, CloseICViewer } = actions;
export const icViewerReducer = reducer;
