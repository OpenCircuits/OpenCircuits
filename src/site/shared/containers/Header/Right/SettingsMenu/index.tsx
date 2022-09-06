import {useEffect} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {ToggleDebugCullboxes, ToggleDebugNoFill,
        ToggleDebugPressableBounds, ToggleDebugSelectionBounds} from "shared/state/DebugInfo";
import {CloseHeaderMenus, OpenHeaderMenu} from "shared/state/Header";

import {SwitchToggle} from "shared/components/SwitchToggle";

import {Dropdown} from "../Dropdown";

import {AutoSaveToggle} from "./AutoSaveToggle";


type Props = {
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}
export const SettingsMenu = ({ helpers, info }: Props) => {
    const { curMenu, debugInfo } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu, debugInfo: state.debugInfo })
    );
    const dispatch = useSharedDispatch();

    // We need this to connect the Redux state to the CircuitInfo state
    // (keeps CircuitInfo in sync with the Redux state)
    useEffect(() => {
        info.debugOptions = debugInfo;
        info.renderer.render();
    }, [info, debugInfo, debugInfo.debugCullboxes, debugInfo.debugPressableBounds,
        debugInfo.debugSelectionBounds, debugInfo.debugNoFill]); // Updates when any of the debugInfo values change

    return (
        <Dropdown open={(curMenu === "settings")}
                  btnInfo={{ title: "User Settings", src: "img/icons/settings.svg" }}
                  onClick={() => dispatch(OpenHeaderMenu("settings"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <AutoSaveToggle helpers={helpers} />
            {process.env.NODE_ENV === "development" &&
                (<>
                    <h1>Debug</h1>
                    <hr />
                    <SwitchToggle
                        isOn={debugInfo.debugCullboxes}
                        onChange={() => dispatch(ToggleDebugCullboxes())}>
                        Debug Cullboxes : {debugInfo.debugCullboxes ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugPressableBounds}
                        onChange={() => dispatch(ToggleDebugPressableBounds())}>
                        Debug Pressable Bounds : {debugInfo.debugPressableBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugSelectionBounds}
                        onChange={() => dispatch(ToggleDebugSelectionBounds())}>
                        Debug Selection Bounds : {debugInfo.debugSelectionBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugNoFill}
                        onChange={() => dispatch(ToggleDebugNoFill())}>
                        Debug No Fill : {debugInfo.debugNoFill ? "On" : "Off"}
                    </SwitchToggle>
                </>)}
        </Dropdown>
    );
}
