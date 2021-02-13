import {Dispatch} from "react";
import {connect} from "react-redux";

import {AppState} from "site/state";
import {AllSharedActions} from "site/state/actions";
import {ToggleCircuitLocked, SetCircuitName, SetCircuitSaved} from "site/state/CircuitInfo/actions";
import {ToggleSideNav} from "site/state/SideNav/actions";

import "./index.scss";


type OwnProps = {}
type StateProps = {
    isLocked: boolean;
    isSaved: boolean;
    circuitName: string;
}
type DispatchProps = {
    toggleLock: () => void;
    toggleSideNav: () => void;
    setCircuitName: (name: string) => void;
    save: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _HeaderLeft = ({ isLocked, isSaved, circuitName, toggleLock, toggleSideNav, setCircuitName, save }: Props) => (
    <div className="header__left">
        <div>
            <span title="Side Bar" role="button" tabIndex={0}
                  onClick={() => toggleSideNav()}>&#9776;</span>
        </div>
        <div>
            <button className="header__left__lock"
                    title="Lock/Unlock Editing"
                    onClick={() => toggleLock()}>
                <img src="img/icons/lock_open.svg" className={isLocked ? "hide" : ""} alt="Icon for unlocked lock" />
                <img src="img/icons/lock.svg"      className={isLocked ? "" : "hide"} alt="Icon for lock" />
            </button>
        </div>
        <div>
            <input title="Circuit Name" type="text"
                   value={circuitName}
                   placeholder="Untitled Circuit*"
                   onChange={(s) => setCircuitName(s.target.value)}
                   alt="Name of project" />
        </div>
        <div>
            <button className={`header__left__save ${isSaved ? "invisible" : ""}`}
                    title="Save the circuit remotely"
                    onClick={() => save()}>Save</button>
        </div>
    </div>
);


/*
 * Redux state connection
 */
const MapState = (state: AppState) => ({
    circuitName: state.circuit.name,
    isSaved:     state.circuit.isSaved,
    isLocked:    state.circuit.isLocked
});
const MapDispatch = (dispatch: Dispatch<AllSharedActions>) => ({
    toggleLock:     ()             => dispatch(ToggleCircuitLocked()),
    save:           ()             => dispatch(SetCircuitSaved()),
    toggleSideNav:  ()             => dispatch(ToggleSideNav()),
    setCircuitName: (name: string) => dispatch(SetCircuitName(name)),
});
export const HeaderLeft = connect<StateProps, DispatchProps, OwnProps, AppState>(MapState, MapDispatch)(_HeaderLeft);
