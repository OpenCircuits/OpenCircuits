import {CircuitInfoState} from "./CircuitInfo";
import {ContextMenuState} from "./ContextMenu";
import {DebugInfoState}   from "./DebugInfo";
import {HeaderState}      from "./Header";
import {ItemNavState}     from "./ItemNav";
import {SideNavState}     from "./SideNav";
import {UserInfoState}    from "./UserInfo";


export type SharedAppState = {
    user: UserInfoState;
    circuit: CircuitInfoState;
    header: HeaderState;
    sideNav: SideNavState;
    itemNav: ItemNavState;
    contextMenu: ContextMenuState;
    debugInfo: DebugInfoState;
}
