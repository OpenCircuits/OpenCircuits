import {UserInfoState}    from "./UserInfo";
import {CircuitInfoState} from "./CircuitInfo";
import {HeaderState}      from "./Header";
import {SideNavState}     from "./SideNav";
import {ItemNavState}     from "./ItemNav";
import {ContextMenuState} from "./ContextMenu";


export type SharedAppState = {
    user: UserInfoState;
    circuit: CircuitInfoState;
    header: HeaderState;
    sideNav: SideNavState;
    itemNav: ItemNavState;
    contextMenu: ContextMenuState;
}
