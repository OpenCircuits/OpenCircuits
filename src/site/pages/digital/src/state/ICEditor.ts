import {ICData} from "digital/models/ioobjects";
import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        isActive: false,
        ic: undefined as ICData | undefined,
    },
    {
        OpenICEditor:  (data: ICData) => ({ type: "OPEN_ICEDITOR_ID", data }) as const,
        CloseICEditor: ()             => ({ type: "CLOSE_ICEDITOR_ID"      }) as const,
    },
    {
        "OPEN_ICEDITOR_ID":  (_, action) => ({ isActive: true, ic: action.data }),
        "CLOSE_ICEDITOR_ID": (_)         => ({ isActive: false, ic: undefined }),
    }
);

export type ICEditorState = typeof initialState;
export const {OpenICEditor, CloseICEditor} = actions;
export const icEditorReducer = reducer;
