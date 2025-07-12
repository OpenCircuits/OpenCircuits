import {useEffect} from "react";

import {useCurDesigner}                       from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {ToggleDebugValue} from "shared/site/state/DebugInfo";
import {CloseHeaderMenus, OpenHeaderMenu} from "shared/site/state/Header";

import {SwitchToggle} from "shared/site/components/SwitchToggle";

import {Dropdown} from "../Dropdown";

import {AutoSaveToggle} from "./AutoSaveToggle";
import {DebugOptions} from "shared/api/circuitdesigner/public/impl/DebugOptions";

import settingsIcon from "./settings.svg";


export const SettingsMenu = () => {
    const designer = useCurDesigner();
    const { curMenu, debugInfo } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu, debugInfo: state.debugInfo })
    );
    const dispatch = useSharedDispatch();

    // We need this to connect the Redux state to the CircuitInfo state
    // (keeps CircuitInfo in sync with the Redux state)
    // TODO[master](leon) - figure out a better system for this
    //  maybe even put all the react-redux stuff into the CircuitDesigner
    //  especially the gross 'useAPIMethods' thing
    useEffect(() => {
        designer.viewport.debugOptions = debugInfo;
    }, [debugInfo, designer]); // Updates when any of the debugInfo values change

    return (
        <Dropdown open={(curMenu === "settings")}
                  btnInfo={{ title: "User Settings", src: settingsIcon }}
                  onClick={() => dispatch(OpenHeaderMenu("settings"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <AutoSaveToggle />
            {process.env.NODE_ENV === "development" &&
                (<>
                    <h1>Debug</h1>
                    <hr />
                    {Object.entries(debugInfo).map(([key, val]) => (
                        <SwitchToggle
                            key={key}
                            isOn={val}
                            onChange={() => dispatch(ToggleDebugValue(key as keyof DebugOptions))}>
                            {key} : {val ? "On" : "Off"}
                        </SwitchToggle>))}
                </>)}
        </Dropdown>
    );
}
