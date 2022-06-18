import {AllSharedActions} from "shared/state/actions";
import {ActionCreatorType} from "shared/utils/CreateState";


type ActionCreators =
    typeof import("./Sim");

export type AllActions = AllSharedActions | {
    [Name in keyof ActionCreators]: ActionCreators[Name] extends ActionCreatorType
        ? ReturnType<ActionCreators[Name]>
        : never
}[keyof ActionCreators];
