import {useEffect} from "react";

import {SAVE_TIME} from "shared/src/utils/Constants";

import {useAPIMethods} from "shared/src/utils/ApiMethods";

import {useMainDesigner}                      from "shared/src/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/src/utils/hooks/useShared";

import {SetAutoSave} from "shared/src/state/UserInfo";

import {SwitchToggle} from "shared/src/components/SwitchToggle";


export const AutoSaveToggle = () => {
    const designer = useMainDesigner();
    const { SaveCircuitRemote } = useAPIMethods(designer.circuit);
    const { isLoggedIn, isSaved, autoSave } = useSharedSelector(
        (state) => ({ ...state.user, isSaved: state.circuit.isSaved })
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
            const success = await SaveCircuitRemote();
            attempts++;
            if (!success)
                // Wait longer each successsive, failed save
                timeout = window.setTimeout(Save, SAVE_TIME * attempts);
        }

        timeout = window.setTimeout(Save, SAVE_TIME);

        return () => clearTimeout(timeout);
     }, [isSaved, autoSave, isLoggedIn, SaveCircuitRemote]);

    return (
        <SwitchToggle
            isOn={autoSave} disabled={!isLoggedIn}
            onChange={() => dispatch(SetAutoSave(!autoSave))}>
            Auto Save : {isLoggedIn && autoSave ? "On" : "Off"}
        </SwitchToggle>
    );
}
