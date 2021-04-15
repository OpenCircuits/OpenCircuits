import {connect} from "react-redux";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {SharedAppState} from "shared/state";
import {HeaderMenus} from "shared/state/Header/state";
import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header/actions";

import {Dropdown} from "../Dropdown";
import {AutoSaveToggle} from "./AutoSaveToggle";

import "./index.scss";


type OwnProps = {
    helpers: CircuitInfoHelpers;
}
type StateProps = {
    curMenu: HeaderMenus;
}
type DispatchProps = {
    OpenHeaderMenu: typeof OpenHeaderMenu;
    CloseHeaderMenus: typeof CloseHeaderMenus;
}

type Props = StateProps & DispatchProps & OwnProps;
const _SettingsMenu = ({ helpers, curMenu, OpenHeaderMenu, CloseHeaderMenus }: Props) => (
    <Dropdown open={(curMenu === "settings")}
              onClick={() => OpenHeaderMenu("settings")}
              onClose={() => CloseHeaderMenus()}
              btnInfo={{title: "User Settings", src: "img/icons/settings.svg"}}>
        <AutoSaveToggle helpers={helpers} />
    </Dropdown>
);


export const SettingsMenu = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state: SharedAppState) => ({ curMenu: state.header.curMenu }),
    { OpenHeaderMenu, CloseHeaderMenus }
)(_SettingsMenu);
