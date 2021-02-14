import {SharedAppState}  from "shared/state";

import {ICDesignerState} from "./ICDesigner/state";
import {ICViewerState}   from "./ICViewer/state";


export type AppState = SharedAppState & {
    icDesigner: ICDesignerState;
    icViewer: ICViewerState;
}
