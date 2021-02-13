import {Dispatch} from "react";
import {connect} from "react-redux";

import {CircuitMetadata} from "core/models/CircuitMetadata";

import {AppState} from "site/state";
import {AllSharedActions} from "site/state/actions";
import {ToggleSideNav} from "site/state/SideNav/actions";

import {Overlay} from "site/components/Overlay";
import {CircuitPreview} from "site/components/CircuitPreview";

import "./index.scss";


type OwnProps = {
    exampleCircuits: CircuitMetadata[];
}
type StateProps = {
    isOpen: boolean;
    userCircuits: CircuitMetadata[];
}
type DispatchProps = {
    toggle: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
function _SideNav({ isOpen, userCircuits, exampleCircuits, toggle }: Props) {
    return (
    <>
        <Overlay isOpen={isOpen} close={toggle} />

        <div className={`sidenav ${isOpen ? "" : "sidenav__move"}`}>
            <div className="sidenav__accountinfo"></div>
            <div className="sidenav__content">
                <h4 unselectable="on">My Circuits</h4>
                <div>
                {userCircuits.map((circuit, i) =>
                    <CircuitPreview key={`sidenav-user-circuit-${i}`}
                                    data={circuit}
                                    onClick={() => {/* RemoteController.LoadUserCircuit(circuit, onCircuitLoad) */}} />
                )}
                </div>
                <h4 unselectable="on">Examples</h4>
                <div>
                {exampleCircuits.map((example, i) =>
                    <CircuitPreview key={`sidenav-example-circuit-${i}`}
                                    readonly
                                    data={example}
                                    onClick={() => {/* RemoteController.LoadExampleCircuit(example, onCircuitLoad) */}} />
                )}
                </div>
                <div className="sidenav__content__footer">
                    A program made with love by <a href="http://leonmontealeg.re/" target="_blank" rel="noopener noreferrer">Leon Montealegre </a>
                    and our great <a href="https://www.github.com/OpenCircuits/OpenCircuits/blob/master/AUTHORS.md" target="_blank" rel="noopener noreferrer">team</a>
                </div>
            </div>
        </div>
    </>
    );
}


const MapState = (state: AppState) => ({
    isOpen: state.sideNav.isOpen,
    userCircuits: state.user.circuits
});
const MapDispatch = (dispatch: Dispatch<AllSharedActions>) => ({
    toggle: () => dispatch(ToggleSideNav())
});
export const SideNav = connect<StateProps, DispatchProps, OwnProps, AppState>(MapState, MapDispatch)(_SideNav);
