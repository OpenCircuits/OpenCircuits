import {AllSharedActions} from "shared/state/actions";
import {ActionCreatorType} from "shared/utils/CreateState";


type ActionCreators =
    typeof import("./ICDesigner") &
    typeof import("./ICViewer");

export type AllActions = AllSharedActions | {
    [Name in keyof ActionCreators]: ActionCreators[Name] extends ActionCreatorType
        ? ReturnType<ActionCreators[Name]>
        : never
}[keyof ActionCreators];
