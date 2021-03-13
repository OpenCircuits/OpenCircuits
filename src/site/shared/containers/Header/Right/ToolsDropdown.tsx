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
type ExtraToolsProps = {
    extraToolsPopupNames: string[];
    extraToolsimgNames: string[];
}

function ToolsList(extraToolsPopupNames: string[], extraToolsimgNames: string[]) {

}

type Props = StateProps & DispatchProps & ExtraToolsProps & OwnProps;
const _ToolsDropdown = ({ curMenu, openMenu, openPopup, closeMenus, extraToolsPopupNames, extraToolsimgNames }: Props) => (
    <Dropdown open={(curMenu === "tools")}
              onClick={() => openMenu("tools")}
              onClose={() => closeMenus()}
              btnInfo={{title: "Tools", src: "img/icons/tools.svg"}}>
        <ToolsList extraToolsPopupNames={[]} extraToolsimgNames={[]} />
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
)(_ToolsDropdown);
