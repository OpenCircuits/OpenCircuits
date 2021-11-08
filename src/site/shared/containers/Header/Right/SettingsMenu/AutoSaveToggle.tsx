import {useEffect} from "react";
import {SAVE_TIME} from "shared/utils/Constants";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {SetAutoSave} from "shared/state/UserInfo";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const AutoSaveToggle = ({helpers}: Props) => {
    const {isLoggedIn, isSaved, autoSave} = useSharedSelector(
        state => ({...state.user, isSaved: state.circuit.isSaved})
    );
    const dispatch = useSharedDispatch();

    useEffect(() => {
        // This function will get called everytime isSaved or isAutoSave is changed
        //  The moment `isSaved` is set to false, this function will get activated
        //  and set a timeout to save the circuit

        // Don't start autosave if user doesn't have it enabled
        //  or if the circuit is already currently saved
        // or if the user is not logged in
        if (!autoSave || isSaved || !isLoggedIn)
            return;

        let attempts = 1; // Track attempted saves
        let timeout: number;

        async function Save() {
            const success = await helpers.SaveCircuitRemote();
            attempts++;
            if (!success)
                // Wait longer each successsive, failed save
                timeout = window.setTimeout(Save, SAVE_TIME * attempts);
        }

        timeout = window.setTimeout(Save, SAVE_TIME);

        return () => clearTimeout(timeout);
     }, [isSaved, autoSave, isLoggedIn, helpers]);

    return (
        <div className={`header_right_settings_autosave ${isLoggedIn ? "" : "disabled"}`}
             onClick={() => dispatch(SetAutoSave(!autoSave))}>
            <img src="img/items/switchDown.svg" style={{display: (autoSave && isLoggedIn ? "" : "none")}}
                 height="100%" alt="Auto save on" />
            <img src="img/items/switchUp.svg" style={{display: (autoSave && isLoggedIn ? "none" : "")}}
                 height="100%" alt="Auto save off"/>
            <span title="Auto-Save" >
                Auto Save: {autoSave && isLoggedIn ? "On" : "Off"}
            </span>
        </div>
    );
}
