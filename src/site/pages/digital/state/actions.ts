import {AllSharedActions} from "shared/shared/state/actions";
import {ICDesignerActions} from "./ICDesigner/actions";
import {ICViewerActions} from "./ICViewer/actions";


export type AllActions =
    AllSharedActions  |
    ICDesignerActions |
    ICViewerActions;
