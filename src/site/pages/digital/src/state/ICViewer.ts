import {IC} from "digital/models/ioobjects";

import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isActive: false,
        ic:       undefined as IC | undefined,
    },
    {
        OpenICViewer:  (data: IC) => ({ type: "OPEN_ICVIEWER_ID", data }) as const,
        CloseICViewer: ()         => ({ type: "CLOSE_ICVIEWER_ID"      }) as const,
    },
    {
        "OPEN_ICVIEWER_ID":  (_, action) => ({ isActive: true, ic: action.data }),
        "CLOSE_ICVIEWER_ID": (_)         => ({ isActive: false, ic: undefined }),
    }
);

export type ICViewerState = typeof initialState;
export const { OpenICViewer, CloseICViewer } = actions;
export const icViewerReducer = reducer;
