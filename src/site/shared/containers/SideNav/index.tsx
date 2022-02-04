import {CircuitMetadata} from "core/models/CircuitMetadata";

import {VersionConflictResolver} from "digital/utils/DigitalVersionConflictResolver"

import {Request} from "shared/utils/Request";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {LoadUserCircuit} from "shared/api/Circuits";

import {ToggleSideNav} from "shared/state/SideNav";

import {Overlay} from "shared/components/Overlay";
import {CircuitPreview} from "shared/components/CircuitPreview";

import {SignInOutButtons} from "shared/containers/Header/Right/SignInOutButtons";

import "./index.scss";


function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return Request({
        method: "GET",
        url: `/examples/${data.getId()}`,
        headers: {}
    })
    // We want to run example circuits through the VersionConflictResolver to make sure they're up to date.
   .then(VersionConflictResolver);
}

type Props = {
    helpers: CircuitInfoHelpers;
    exampleCircuits: CircuitMetadata[];
}
export const SideNav = ({ helpers, exampleCircuits }: Props) => {
    const { auth, circuits, isOpen, loading, loadingCircuits } = useSharedSelector(
        state => ({ ...state.user, isOpen: state.sideNav.isOpen,
                    loading: state.circuit.loading, loadingCircuits: state.user.loading })
    );
    const dispatch = useSharedDispatch();

    return (<>
        <Overlay
            isOpen={isOpen}
            close={() => {
                if (!loading) // Don't let user close the SideNav until finished loading circuit
                    dispatch(ToggleSideNav())
            }}>
            {loading && <div></div>}
        </Overlay>

        <div className={`sidenav ${isOpen ? "" : "sidenav__move"}`}>
            <div className="sidenav__accountinfo">
                <div className="sidenav__accountinfo__name">
                    {auth ? `Hello, ${auth.getName()}!` : null}
                </div>
                <div className="sidenav__accountinfo__sign">
                    <SignInOutButtons />
                </div>
            </div>
            <div className="sidenav__content">
                <h4 unselectable="on">My Circuits</h4>
                <div>
                {loadingCircuits ?
                    <div className="sidenav__content__circuits-loading"></div> :
                    circuits.map((circuit, i) =>
                        <CircuitPreview
                            key={`sidenav-user-circuit-${i}`}
                            data={circuit}
                            onClick={async () => {
                                if (loading) // Don't load another circuit if already loading
                                    return;
                                if (!auth)
                                    throw new Error("Sidenav failed: auth is undefined");
                                await helpers.LoadCircuit(() => LoadUserCircuit(auth, circuit.getId()));
                                dispatch(ToggleSideNav());
                            }}
                            onDelete={() => {
                                if (loading) // Don't let user delete circuit while loading
                                    return;
                                helpers.DeleteCircuitRemote(circuit);
                            }} />
                )}
                </div>
                <h4 unselectable="on">Examples</h4>
                <div>
                {exampleCircuits.map((example, i) =>
                    <CircuitPreview key={`sidenav-example-circuit-${i}`}
                                    readonly
                                    data={example}
                                    onClick={async () => {
                                        if (loading) // Don't load another circuit if already loading
                                            return;
                                        await helpers.LoadCircuit(() => LoadExampleCircuit(example));
                                        dispatch(ToggleSideNav());
                                    }}
                                    onDelete={() => { /* Do nothing */ }} />
                )}
                </div>
                <div className="sidenav__content__footer">
                    A program made with love by <a href="http://leonmontealeg.re/" target="_blank"
                                                   rel="noopener noreferrer">Leon Montealegre </a>
                    and our great <a href="https://www.github.com/OpenCircuits/OpenCircuits/blob/master/AUTHORS.md"
                                     target="_blank" rel="noopener noreferrer">team</a>
                </div>
            </div>
        </div>
    </>);
}