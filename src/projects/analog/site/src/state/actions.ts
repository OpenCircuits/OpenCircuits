import {ActionCreatorType} from "shared/site/utils/CreateState";

import {AllSharedActions} from "shared/site/state/actions";


type ActionCreators =
    typeof import("./Sim");

export type AllActions = AllSharedActions | {
    [Name in keyof ActionCreators]: ActionCreators[Name] extends ActionCreatorType
        ? ReturnType<ActionCreators[Name]>
        : never
}[keyof ActionCreators];
