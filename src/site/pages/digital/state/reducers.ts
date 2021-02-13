import {combineReducers} from "redux";

import {AppState} from ".";

import {userInfoReducer} from "./UserInfo/reducers";
import {circuitInfoReducer} from "./CircuitInfo/reducers";
import {headerReducer} from "./Header/reducers";
import {sideNavReducer} from "./SideNav/reducers";
import {itemNavReducer} from "./ItemNav/reducers";
import {icDesignerReducer} from "./ICDesigner/reducers";
import {icViewerReducer} from "./ICViewer/reducers";


export const reducers = combineReducers<AppState>({
    user: userInfoReducer,
    circuit: circuitInfoReducer,
    header: headerReducer,
    sideNav: sideNavReducer,
    itemNav: itemNavReducer,
    icDesigner: icDesignerReducer,
    icViewer: icViewerReducer
});
