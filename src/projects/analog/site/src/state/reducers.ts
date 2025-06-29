import {combineReducers} from "redux";


import {circuitInfoReducer} from "shared/site/state/CircuitInfo";
import {contextMenuReducer} from "shared/site/state/ContextMenu";
import {debugInfoReducer}   from "shared/site/state/DebugInfo";
import {headerReducer}      from "shared/site/state/Header";
import {itemNavReducer}     from "shared/site/state/ItemNav";
import {sideNavReducer}     from "shared/site/state/SideNav";
import {userInfoReducer}    from "shared/site/state/UserInfo";

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
