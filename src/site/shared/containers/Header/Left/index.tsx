import {connect} from "react-redux";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {SharedAppState} from "shared/state";
import {
    ToggleCircuitLocked,
    SetCircuitName
} from "shared/state/CircuitInfo/actions";
import {ToggleSideNav} from "shared/state/SideNav/actions";

import "./index.scss";


type OwnProps = {
    helpers: CircuitInfoHelpers;
}

type StateProps = {
    circuitName: string;
    isSaved: boolean;
    isLocked: boolean;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string;
}

type DispatchProps = {
    toggleLock: () => void;
    toggleSideNav: () => void;
    setCircuitName: (name: string) => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _HeaderLeft = ({isLocked, isSaved, isLoggedIn, isLoading, circuitName, helpers, error, toggleLock, toggleSideNav,
                         setCircuitName}: Props) => (
    <div className="header__left">
        <div>
            <span title="Side Bar" role="button" tabIndex={0}
                  onClick={() => toggleSideNav()}>&#9776;</span>
        </div>
        <div>
            <button className="header__left__lock"
                    title="Lock/Unlock Editing"
                    onClick={() => toggleLock()}>
                <img src="img/icons/lock_open.svg" className={isLocked ? "hide" : ""} alt="Icon for unlocked lock"/>
                <img src="img/icons/lock.svg" className={isLocked ? "" : "hide"} alt="Icon for lock"/>
            </button>
        </div>
        <div>
            <input title="Circuit Name" type="text"
                   value={circuitName}
                   placeholder="Untitled Circuit*"
                   onChange={(s) => setCircuitName(s.target.value)}
                   alt="Name of project"/>
        </div>
        <div>
            <button className={`header__left__save ${isSaved ? "invisible" : ""}`}
                    title={isLoggedIn?"Save the circuit remotely":"Log In to save the circuit"}
                    disabled={isLoading || !isLoggedIn}
                    onClick={isLoggedIn ? () => helpers.SaveCircuitRemote() : null}>Save
            </button>
        </div>
        <div className="header__left__saving__icons">
            <img src="img/icons/error.svg" className={error ? "" : "hide"}
                 title={`Error occured while saving: ${error}`} alt="Icon when save failed"/>
            <span className={isLoading ? "" : "hide"} title="Saving..."/>
        </div>
    </div>
);


/*
 * Redux state connection
 */
const MapState = (state: SharedAppState) => ({
    circuitName: state.circuit.name,
    isSaved: state.circuit.isSaved,
    isLocked: state.circuit.isLocked,
    isLoggedIn: state.user.isLoggedIn,
    isLoading: state.circuit.saving,
    error: state.circuit.error
});

const MapDispatch = {
    toggleLock: ToggleCircuitLocked,
    toggleSideNav: ToggleSideNav,
    setCircuitName: SetCircuitName
};
export const HeaderLeft = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    MapState,
    MapDispatch
)(_HeaderLeft);
