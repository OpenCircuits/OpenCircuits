import {connect} from "react-redux";

import {SharedAppState} from "shared/state";
import {HeaderMenus, HeaderPopups} from "shared/state/Header/state";
import {OpenHeaderMenu, OpenHeaderPopup, CloseHeaderMenus} from "shared/state/Header/actions";

import {Dropdown} from "./Dropdown";
import {ToolsList} from "./ToolsList";

type Tool = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

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
    extraTools: Tool[];
}

type Props = StateProps & DispatchProps & ExtraToolsProps & OwnProps;
const _ToolsDropdown = ({ curMenu, openMenu, openPopup, closeMenus, extraTools }: Props) => (
    <Dropdown open={(curMenu === "tools")}
              onClick={() => openMenu("tools")}
              onClose={() => closeMenus()}
              btnInfo={{title: "Tools", src: "img/icons/tools.svg"}}>
        {extraTools.map(tool => (
            <div key={tool.popupName} onClick={() => { closeMenus(); openPopup(tool.popupName); }}>
                <img src={tool.img} height="100%" alt="" />
                <span>{tool.text}</span>
            </div>
        ))}
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
