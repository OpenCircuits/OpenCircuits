import {combineReducers} from "redux";


import {circuitInfoReducer} from "shared/state/CircuitInfo";
import {contextMenuReducer} from "shared/state/ContextMenu";
import {debugInfoReducer}   from "shared/state/DebugInfo";
import {headerReducer}      from "shared/state/Header";
import {itemNavReducer}     from "shared/state/ItemNav";
import {sideNavReducer}     from "shared/state/SideNav";
import {userInfoReducer}    from "shared/state/UserInfo";

import {simStateReducer} from "./Sim";

import {AppState} from ".";


export const reducers = combineReducers<AppState>({
    user:        userInfoReducer,
    circuit:     circuitInfoReducer,
    header:      headerReducer,
    sideNav:     sideNavReducer,
    itemNav:     itemNavReducer,
    contextMenu: contextMenuReducer,
    debugInfo:   debugInfoReducer,
    sim:         simStateReducer,
});
