import {useEffect} from "react";

import {useMainDesigner}                      from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {ToggleDebugCullboxes, ToggleDebugNoFill,
        ToggleDebugPressableBounds, ToggleDebugSelectionBounds} from "shared/site/state/DebugInfo";
import {CloseHeaderMenus, OpenHeaderMenu} from "shared/site/state/Header";

import {SwitchToggle} from "shared/site/components/SwitchToggle";

import {Dropdown} from "../Dropdown";

import {AutoSaveToggle} from "./AutoSaveToggle";


export const SettingsMenu = () => {
    const designer = useMainDesigner();
    const { curMenu, debugInfo } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu, debugInfo: state.debugInfo })
    );
    const dispatch = useSharedDispatch();

    // We need this to connect the Redux state to the CircuitInfo state
    // (keeps CircuitInfo in sync with the Redux state)
    // TODO[model_refactor](leon) - figure out a better system for this
    //  maybe even put all the react-redux stuff into the CircuitDesigner
    //  especially the gross 'useAPIMethods' thing
    useEffect(() => {
        designer.debugOptions = debugInfo;
    }, [designer, debugInfo, debugInfo.debugCullboxes, debugInfo.debugPressableBounds,
        debugInfo.debugSelectionBounds, debugInfo.debugNoFill]); // Updates when any of the debugInfo values change

    return (
        <Dropdown open={(curMenu === "settings")}
                  btnInfo={{ title: "User Settings", src: "img/icons/settings.svg" }}
                  onClick={() => dispatch(OpenHeaderMenu("settings"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <AutoSaveToggle />
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
