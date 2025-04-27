import {useEffect} from "react";

import {useCurDesigner}                       from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {ToggleDebugPrimBounds, ToggleDebugComponentBounds, ToggleDebugWireBounds,
        ToggleDebugPortBounds, ToggleDebugPressableBounds} from "shared/site/state/DebugInfo";
import {CloseHeaderMenus, OpenHeaderMenu} from "shared/site/state/Header";

import {SwitchToggle} from "shared/site/components/SwitchToggle";

import {Dropdown} from "../Dropdown";

import {AutoSaveToggle} from "./AutoSaveToggle";


export const SettingsMenu = () => {
    const designer = useCurDesigner();
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
        designer.viewport.debugOptions = debugInfo;
    }, [designer, debugInfo, debugInfo.debugPrimBounds, debugInfo.debugComponentBounds, debugInfo.debugWireBounds,
        debugInfo.debugPortBounds, debugInfo.debugPressableBounds]); // Updates when any of the debugInfo values change

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
                        isOn={debugInfo.debugPrimBounds}
                        onChange={() => dispatch(ToggleDebugPrimBounds())}>
                        Debug Prims : {debugInfo.debugPrimBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugComponentBounds}
                        onChange={() => dispatch(ToggleDebugComponentBounds())}>
                        Debug Component Bounds : {debugInfo.debugComponentBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugWireBounds}
                        onChange={() => dispatch(ToggleDebugWireBounds())}>
                        Debug Wire Bounds : {debugInfo.debugWireBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugPortBounds}
                        onChange={() => dispatch(ToggleDebugPortBounds())}>
                        Debug Port Bounds : {debugInfo.debugPortBounds ? "On" : "Off"}
                    </SwitchToggle>
                    <SwitchToggle
                        isOn={debugInfo.debugPressableBounds}
                        onChange={() => dispatch(ToggleDebugPressableBounds())}>
                        Debug Pressable Bounds : {debugInfo.debugPressableBounds ? "On" : "Off"}
                    </SwitchToggle>
                </>)}
        </Dropdown>
    );
}
