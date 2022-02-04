import {combineReducers} from "redux";

import {AppState} from ".";

import {userInfoReducer}    from "shared/state/UserInfo";
import {circuitInfoReducer} from "shared/state/CircuitInfo";
import {headerReducer}      from "shared/state/Header";
import {sideNavReducer}     from "shared/state/SideNav";
import {itemNavReducer}     from "shared/state/ItemNav";
import {contextMenuReducer} from "shared/state/ContextMenu";
import {debugInfoReducer}   from "shared/state/DebugInfo";
import {icDesignerReducer}  from "./ICDesigner";
import {icViewerReducer}    from "./ICViewer";


export const reducers = combineReducers<AppState>({
    user: userInfoReducer,
    circuit: circuitInfoReducer,
    header: headerReducer,
    sideNav: sideNavReducer,
    itemNav: itemNavReducer,
    contextMenu: contextMenuReducer,
    debugInfo: debugInfoReducer,
    icDesigner: icDesignerReducer,
    icViewer: icViewerReducer
});
