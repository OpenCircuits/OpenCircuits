import {combineReducers} from "redux";

import {AppState} from ".";

import {userInfoReducer}    from "shared/state/UserInfo/reducers";
import {circuitInfoReducer} from "shared/state/CircuitInfo/reducers";
import {headerReducer}      from "shared/state/Header/reducers";
import {sideNavReducer}     from "shared/state/SideNav/reducers";
import {itemNavReducer}     from "shared/state/ItemNav/reducers";
import {icDesignerReducer}  from "./ICDesigner/reducers";
import {icViewerReducer}    from "./ICViewer/reducers";


export const reducers = combineReducers<AppState>({
    user: userInfoReducer,
    circuit: circuitInfoReducer,
    header: headerReducer,
    sideNav: sideNavReducer,
    itemNav: itemNavReducer,
    icDesigner: icDesignerReducer,
    icViewer: icViewerReducer
});
