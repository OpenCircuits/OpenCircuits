import {UserInfoActions} from "./UserInfo/actions";
import {CircuitInfoActions} from "./CircuitInfo/actions";
import {HeaderActions} from "./Header/actions";
import {SideNavActions} from "./SideNav/actions";
import {ItemNavActions} from "./ItemNav/actions";
import {ContextMenuActions} from "./ContextMenu/actions";


export type AllSharedActions =
    UserInfoActions    |
    CircuitInfoActions |
    HeaderActions      |
    SideNavActions     |
    ItemNavActions     |
    ContextMenuActions;
