import {useEffect} from "react";
import {connect} from "react-redux";
import {SharedAppState} from "shared/state";
import {SetAutoSave} from "shared/state/UserInfo/actions";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import { GetCookie } from "shared/utils/Cookies";
import {SAVE_TIME} from "shared/utils/Constants";

import "./index.scss";

type OwnProps = {
  helpers: CircuitInfoHelpers;
}
type StateProps = {
    isLoggedIn: boolean;
    isAutoSave: boolean;
}
type DispatchProps = {
  SetAutoSave: typeof SetAutoSave
}

type Props = StateProps & DispatchProps & OwnProps;
const _AutoSaveButton = ({isLoggedIn, isAutoSave, helpers, SetAutoSave}: Props) => {

    useEffect(() => { 
        setInterval(() => helpers.AutoSaveCircuit(), SAVE_TIME);
     }, []);

    return (
        <div className="header__right__account">
            <button title="Auto-Save"
                    style={{ display: (isLoggedIn ? "initial" : "none") }}
                    onClick={ () => SetAutoSave() }
            >Auto Save: {isAutoSave ? "On" : "Off"}
            </button>
        </div>
    );
}

export const AutoSaveButton = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLoggedIn: state.user.isLoggedIn, isAutoSave: state.user.autoSave }),
    {SetAutoSave}
)(_AutoSaveButton);