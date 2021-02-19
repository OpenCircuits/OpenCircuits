import {UserInfoState}    from "./UserInfo/state";
import {CircuitInfoState} from "./CircuitInfo/state";
import {HeaderState}      from "./Header/state";
import {SideNavState}     from "./SideNav/state";
import {ItemNavState}     from "./ItemNav/state";
import {ContextMenuState} from "./ContextMenu/state";


export type SharedAppState = {
    user: UserInfoState;
    circuit: CircuitInfoState;
    header: HeaderState;
    sideNav: SideNavState;
    itemNav: ItemNavState;
    contextMenu: ContextMenuState;
}
