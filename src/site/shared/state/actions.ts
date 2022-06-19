import {ActionCreatorType} from "shared/utils/CreateState";


type ActionCreators =
    typeof import("./Header")      &
    typeof import("./ContextMenu") &
    typeof import("./SideNav")     &
    typeof import("./ItemNav")     &
    typeof import("./CircuitInfo") &
    typeof import("./UserInfo")    &
    typeof import("./DebugInfo");

export type AllSharedActions = {
    [Name in keyof ActionCreators]: ActionCreators[Name] extends ActionCreatorType
        ? ReturnType<ActionCreators[Name]>
        : never
}[keyof ActionCreators];
