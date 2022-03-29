import {Store} from "redux";
import {ThunkDispatch} from "redux-thunk";
import {SharedAppState}  from "shared/state";
import {AllActions} from "./actions";

import {ICDesignerState} from "./ICDesigner";
import {ICEditorState} from "./ICEditor";
import {ICViewerState}   from "./ICViewer";


export type AppState = SharedAppState & {
    icDesigner: ICDesignerState;
    icEditor: ICEditorState;
    icViewer: ICViewerState;
}

export type AppStore = Store<AppState, AllActions> & {
    dispatch: ThunkDispatch<AppState, undefined, AllActions>;
}
