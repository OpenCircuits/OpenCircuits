import {connect} from "react-redux";
import {SharedAppState} from "shared/state";
import {SetAutoSave} from "shared/state/UserInfo/actions";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

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
  setAutoSave: () => void
}

type Props = StateProps & DispatchProps & OwnProps;
const _AutoSaveButton = ({isLoggedIn, isAutoSave, helpers, setAutoSave}: Props) => (
    <div className="header__right__account">
        <button title="Auto-Save"
                style={{ display: (isLoggedIn ? "initial" : "none") }}
                onClick={ () => {
                    setAutoSave();
                    setInterval(() => helpers.AutoSaveCircuit(), SAVE_TIME);
                }}
        >Auto Save: {isAutoSave ? "On" : "Off"}
        </button>
    </div>
);

const MapDispatch = {
  setAutoSave: SetAutoSave
}

export const AutoSaveButton = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLoggedIn: state.user.isLoggedIn, isAutoSave: state.user.autoSave }),
    MapDispatch
)(_AutoSaveButton);