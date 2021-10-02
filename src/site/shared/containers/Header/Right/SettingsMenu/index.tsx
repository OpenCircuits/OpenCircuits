import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header";

import {Dropdown} from "../Dropdown";
import {AutoSaveToggle} from "./AutoSaveToggle";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const SettingsMenu = ({ helpers }: Props) => {
    const {curMenu} = useSharedSelector(
        state => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();

    return (
        <Dropdown open={(curMenu === "settings")}
                  onClick={() => dispatch(OpenHeaderMenu("settings"))}
                  onClose={() => dispatch(CloseHeaderMenus())}
                  btnInfo={{title: "User Settings", src: "img/icons/settings.svg"}}>
            <AutoSaveToggle helpers={helpers} />
        </Dropdown>
    );
}
