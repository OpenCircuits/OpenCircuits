import {useEffect} from "react";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header";
import {ToggleDebugCullboxes, ToggleDebugNoFill,
        ToggleDebugPressableBounds, ToggleDebugSelectionBounds} from "shared/state/DebugInfo";

import {SwitchToggle} from "shared/components/SwitchToggle";
import {Dropdown} from "../Dropdown";
import {AutoSaveToggle} from "./AutoSaveToggle";

type Props = {
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}
export const SettingsMenu = ({ helpers, info }: Props) => {
    const {curMenu, debugInfo} = useSharedSelector(
        state => ({ curMenu: state.header.curMenu, debugInfo: state.debugInfo })
    );
    const dispatch = useSharedDispatch();

    // We need this to connect the Redux state to the CircuitInfo state
    // (keeps CircuitInfo in sync with the Redux state)
    useEffect(() => {
        info.debugOptions = debugInfo;
        info.renderer.render();
    }, [...Object.values(debugInfo)]); // Updates when any of the debugInfo values change

    return (
        <Dropdown open={(curMenu === "settings")}
                  onClick={() => dispatch(OpenHeaderMenu("settings"))}
                  onClose={() => dispatch(CloseHeaderMenus())}
                  btnInfo={{title: "User Settings", src: "img/icons/settings.svg"}}>
            <AutoSaveToggle helpers={helpers}/>
            {process.env.NODE_ENV === "development" &&
                <>
                    <h1>Debug</h1>
                    <hr/>
                    <SwitchToggle isOn={debugInfo.debugCullboxes}
                                  onChange={() => dispatch(ToggleDebugCullboxes())}
                                  text={"Debug Cullboxes"} />
                    <SwitchToggle isOn={debugInfo.debugPressableBounds}
                                  onChange={() => dispatch(ToggleDebugPressableBounds())}
                                  text={"Debug Pressable Bounds"} />
                    <SwitchToggle isOn={debugInfo.debugSelectionBounds}
                                  onChange={() => dispatch(ToggleDebugSelectionBounds())}
                                  text={"Debug Selection Bounds"} />
                    <SwitchToggle isOn={debugInfo.debugNoFill}
                                  onChange={() => dispatch(ToggleDebugNoFill())}
                                  text={"Debug No Fill"} />
                </>
            }
        </Dropdown>
    );
}
