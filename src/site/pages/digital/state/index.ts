import {UserInfoState} from "./UserInfo/state";
import {CircuitInfoState} from "./CircuitInfo/state";
import {HeaderState} from "./Header/state";
import {SideNavState} from "./SideNav/state";
import {ItemNavState} from "./ItemNav/state";
import {ICDesignerState} from "./ICDesigner/state";
import {ICViewerState} from "./ICViewer/state";


export type AppState = {
    user: UserInfoState;
    circuit: CircuitInfoState;
    header: HeaderState;
    sideNav: SideNavState;
    itemNav: ItemNavState;
    icDesigner: ICDesignerState;
    icViewer: ICViewerState;
}
