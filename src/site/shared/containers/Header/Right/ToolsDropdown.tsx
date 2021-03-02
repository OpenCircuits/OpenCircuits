import {connect} from "react-redux";

import {SharedAppState} from "shared/state";
import {HeaderMenus, HeaderPopups} from "shared/state/Header/state";
import {OpenHeaderMenu, OpenHeaderPopup, CloseHeaderMenus} from "shared/state/Header/actions";

import {Dropdown} from "./Dropdown";


type OwnProps = {}
type StateProps = {
    curMenu: HeaderMenus;
}
type DispatchProps = {
    openMenu: (menu: HeaderMenus) => void;
    openPopup: (popup: HeaderPopups) => void;
    closeMenus: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _TutorialDropdown = ({ curMenu, openMenu, openPopup, closeMenus }: Props) => (
    <Dropdown open={(curMenu === "tools")}
              onClick={() => openMenu("tools")}
              onClose={() => closeMenus()}
        <div onClick={() => { closeMenus(); openPopup("quick_start"); }}>
              btnInfo={{title: "Help", src: "img/icons/tools.svg"}}>
            <img src="img/icons/bool_expr_input_icon.svg" height="100%" alt="" />
            <span>Boolean Expression to Circuit</span>
        </div>
    </Dropdown>
);


const MapState = (state: SharedAppState) => ({
    curMenu: state.header.curMenu
});
const MapDispatch = {
    openMenu: OpenHeaderMenu,
    openPopup: OpenHeaderPopup,
    closeMenus: CloseHeaderMenus
};
export const ToolsDropdown = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    MapState,
    MapDispatch
)(_TutorialDropdown);
