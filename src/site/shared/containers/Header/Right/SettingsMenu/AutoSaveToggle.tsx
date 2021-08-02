import {useEffect} from "react";
import {connect} from "react-redux";

import {SAVE_TIME} from "shared/utils/Constants";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {SharedAppState} from "shared/state";
import {SetAutoSave} from "shared/state/UserInfo/actions";


type OwnProps = {
    helpers: CircuitInfoHelpers;
}
type StateProps = {
    isLoggedIn: boolean;
    isSaved: boolean;
    isAutoSave: boolean;
}
type DispatchProps = {
    SetAutoSave: typeof SetAutoSave;
}

type Props = StateProps & DispatchProps & OwnProps;
const _AutoSaveToggle = ({isLoggedIn, isSaved, isAutoSave, helpers, SetAutoSave}: Props) => {

    useEffect(() => {
        // This function will get called everytime isSaved or isAutoSave is changed
        //  The moment `isSaved` is set to false, this function will get activated
        //  and set a timeout to save the circuit

        // Don't start autosave if user doesn't have it enabled
        //  or if the circuit is already currently saved
        if (!isAutoSave || isSaved)
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
     }, [isSaved, isAutoSave, helpers]);

    return (
        <div className="header__right__settings__autosave" onClick={() => SetAutoSave()}>
            <img src="img/items/switchDown.svg" style={{display: (isAutoSave ? "" : "none")}} height="100%" alt="Auto save on" />
            <img src="img/items/switchUp.svg"   style={{display: (isAutoSave ? "none" : "")}} height="100%" alt="Auto save off" />
            <span title="Auto-Save"
                  style={{ display: (isLoggedIn ? "initial" : "none") }}>
                Auto Save: {isAutoSave ? "On" : "Off"}
            </span>
        </div>
    );
}


export const AutoSaveToggle = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({
        isLoggedIn: state.user.isLoggedIn,
        isSaved: state.circuit.isSaved,
        isAutoSave: state.user.autoSave
    }),
    {SetAutoSave}
)(_AutoSaveToggle);
