import {connect} from "react-redux";

import {CircuitMetadata} from "core/models/CircuitMetadata";

import {VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver"

import {Request} from "shared/utils/Request";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {AuthState} from "shared/api/auth/AuthState";
import {LoadUserCircuit} from "shared/api/Circuits";

import {SharedAppState} from "shared/state";
import {ToggleSideNav} from "shared/state/SideNav/actions";
import {LoadUserCircuits} from "shared/state/UserInfo/actions";

import {Overlay} from "shared/components/Overlay";
import {CircuitPreview} from "shared/components/CircuitPreview";

import "./index.scss";


function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return Request({
        method: "GET",
        url: `/examples/${data.getId()}`,
        headers: {}
    })
    .then(
        (circuitJson) => VersionConflictResolver(circuitJson)
    );
}


type OwnProps = {
    helpers: CircuitInfoHelpers;
    exampleCircuits: CircuitMetadata[];
}
type StateProps = {
    auth: AuthState;
    isOpen: boolean;
    isLoggedIn: boolean;
    userCircuits: CircuitMetadata[];
}
type DispatchProps = {
    LoadUserCircuits: typeof LoadUserCircuits;
    ToggleSideNav: typeof ToggleSideNav;
}

type Props = StateProps & DispatchProps & OwnProps;
const _SideNav = ({ helpers, auth, isOpen, isLoggedIn, userCircuits, exampleCircuits, ToggleSideNav }: Props) => (
    <>
        <Overlay isOpen={isOpen} close={ToggleSideNav} />

        <div className={`sidenav ${isOpen ? "" : "sidenav__move"}`}>
            <div className="sidenav__accountinfo">
                {auth ? `Hello, ${auth.getName()}!` : null}
            </div>
            <div className="sidenav__content">
                <h4 unselectable="on">My Circuits</h4>
                <div>
                {userCircuits.map((circuit, i) =>
                    <CircuitPreview key={`sidenav-user-circuit-${i}`}
                                    data={circuit}
                                    onClick={async () => {
                                        await helpers.LoadCircuit(() => LoadUserCircuit(auth, circuit.getId()));
                                        ToggleSideNav();
                                    }}
                                    onDelete={() => helpers.DeleteCircuitRemote(circuit)} />
                )}
                </div>
                <h4 unselectable="on">Examples</h4>
                <div>
                {exampleCircuits.map((example, i) =>
                    <CircuitPreview key={`sidenav-example-circuit-${i}`}
                                    readonly
                                    data={example}
                                    onClick={async () => {
                                        await helpers.LoadCircuit(() => LoadExampleCircuit(example));
                                        ToggleSideNav();
                                    }}
                                    onDelete={() => { /* Do nothing */ }} />
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


export const SideNav = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({
        auth: state.user.auth,
        isOpen: state.sideNav.isOpen,
        isLoggedIn: state.user.isLoggedIn,
        userCircuits: state.user.circuits
    }),
    { LoadUserCircuits, ToggleSideNav } as any
)(_SideNav);
