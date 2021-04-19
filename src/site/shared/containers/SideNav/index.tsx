import {connect} from "react-redux";

import {CircuitMetadata} from "core/models/CircuitMetadata";

import {VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver"

import {Request} from "shared/utils/Request";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {AuthState} from "shared/api/auth/AuthState";
import {LoadUserCircuit} from "shared/api/Circuits";

import {SharedAppState} from "shared/state";
import {CloseHistoryBox, OpenHistoryBox, ToggleSideNav} from "shared/state/SideNav/actions";
import {LoadUserCircuits} from "shared/state/UserInfo/actions";

import {Overlay} from "shared/components/Overlay";
import {CircuitPreview} from "shared/components/CircuitPreview";

import "./index.scss";
import { CircuitInfo } from "core/utils/CircuitInfo";


function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return Request({
        method: "GET",
        url: `/examples/${data.getId()}`,
        headers: {}
    })
    // We want to run example circuits through the VersionConflictResolver to make sure they're up to date.
   .then(VersionConflictResolver);
}


type OwnProps = {
    info: CircuitInfo;
    helpers: CircuitInfoHelpers;
    exampleCircuits: CircuitMetadata[];
}
type StateProps = {
    auth: AuthState;
    isOpen: boolean;
    isLoggedIn: boolean;
    isHistoryBoxOpen: boolean;
    userCircuits: CircuitMetadata[];
}
type DispatchProps = {
    LoadUserCircuits: typeof LoadUserCircuits;
    ToggleSideNav: typeof ToggleSideNav;
    OpenHistoryBox: typeof OpenHistoryBox;
    CloseHistoryBox: typeof CloseHistoryBox;
}

type Props = StateProps & DispatchProps & OwnProps;
const _SideNav = ({ info, helpers, auth, isOpen, isLoggedIn, isHistoryBoxOpen, userCircuits, exampleCircuits, 
                    ToggleSideNav, OpenHistoryBox, CloseHistoryBox }: Props) => (
    <>
        <Overlay isOpen={isOpen} close={() => {
            CloseHistoryBox();
            ToggleSideNav();
        }} />

        <div className={`sidenav ${isOpen ? "" : "sidenav__move"}`}>
            <div className="sidenav__accountinfo">
                {auth ? `Hello, ${auth.getName()}!` : null}
            </div>
            <div className="sidenav__wrapper">
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
                <div className="sidenav__footer">
                    <button className="sidenav__footer__history" title="History" onClick={() => {
                        if (isHistoryBoxOpen) CloseHistoryBox();
                        else OpenHistoryBox();
                    }}>
                        <img src="img/icons/history.svg"></img>
                    </button>
                </div>
            </div>
        </div>

        <div className="historybox" style={{display: (isHistoryBoxOpen ? "initial" : "none")}}>
            {info.history.getActions().reverse().map((a, i) => {
                return <div key={`history-box-entry-${i}`} className="historybox__entry">{a.getName()}</div>
            })}
        </div>
    </>
);


export const SideNav = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({
        auth: state.user.auth,
        isOpen: state.sideNav.isOpen,
        isLoggedIn: state.user.isLoggedIn,
        isHistoryBoxOpen: state.sideNav.isHistoryBoxOpen,
        userCircuits: state.user.circuits
    }),
    { LoadUserCircuits, ToggleSideNav, OpenHistoryBox, CloseHistoryBox } as any
)(_SideNav);

