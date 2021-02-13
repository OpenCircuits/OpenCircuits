import {UserInfoState}    from "shared/state/UserInfo/state";
import {CircuitInfoState} from "shared/state/CircuitInfo/state";
import {HeaderState}      from "shared/state/Header/state";
import {SideNavState}     from "shared/state/SideNav/state";
import {ItemNavState}     from "shared/state/ItemNav/state";
import {ICDesignerState}  from "./ICDesigner/state";
import {ICViewerState}    from "./ICViewer/state";


export type AppState = {
    user: UserInfoState;
    circuit: CircuitInfoState;
    header: HeaderState;
    sideNav: SideNavState;
    itemNav: ItemNavState;
    icDesigner: ICDesignerState;
    icViewer: ICViewerState;
}
