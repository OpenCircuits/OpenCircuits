import {OVERWRITE_CIRCUIT_MESSAGE} from "shared/utils/Constants";

import {useAPIMethods} from "shared/utils/ApiMethods";
import {Request}       from "shared/utils/Request";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {ToggleSideNav} from "shared/state/SideNav";

import {CircuitPreview} from "shared/components/CircuitPreview";
import {Overlay}        from "shared/components/Overlay";

import {SignInOutButtons} from "shared/containers/Header/Right/SignInOutButtons";

import "./index.scss";

import {Circuit, CircuitMetadata} from "core/public";


function LoadExampleCircuit(data: CircuitMetadata): Promise<string> {
    return Request({
        method:  "GET",
        url:     `/examples/${data.id}`,
        headers: {},
    });
}

type Props = {
    circuit: Circuit;
    exampleCircuits: CircuitMetadata[];
}
export const SideNav = ({ circuit, exampleCircuits }: Props) => {
    const { auth, circuits, isOpen, loading, isSaved, loadingCircuits } = useSharedSelector(
        (state) => ({
            ...state.user,
            isOpen:          state.sideNav.isOpen,
            isSaved:         state.circuit.isSaved,
            loading:         state.circuit.loading,
            loadingCircuits: state.user.loading,
        })
    );
    const dispatch = useSharedDispatch();
    const { LoadCircuit, LoadCircuitRemote, DeleteCircuitRemote } = useAPIMethods(circuit);

    const onReset = () => {
        const open = isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;
        circuit.reset();
        dispatch(ToggleSideNav());
    }

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
                    {auth ? `Hello, ${auth.getName()}!` : undefined}
                </div>
                <div className="sidenav__accountinfo__sign">
                    <SignInOutButtons />
                </div>
            </div>
            <button type="button" onClick={onReset}>
                <span>+</span>
                New Circuit
            </button>
            <div className="sidenav__content">
                <h4 unselectable="on">My Circuits</h4>
                <div>
                    {loadingCircuits
                        ? <div className="sidenav__content__circuits-loading"></div>
                        : circuits.map((circuit, i) =>
                            (<CircuitPreview
                                key={`sidenav-user-circuit-${i}`}
                                data={circuit}
                                onClick={async () => {
                                    if (loading) // Don't load another circuit if already loading
                                        return;
                                    if (!auth)
                                        throw new Error("Sidenav failed: auth is undefined");
                                    await LoadCircuitRemote(circuit["id"]);
                                    dispatch(ToggleSideNav());
                                }}
                                onDelete={() => {
                                    if (loading) // Don't let user delete circuit while loading
                                        return;
                                    const shouldDelete = window.confirm(
                                        `Are you sure you want to delete circuit "${circuit.name}"?`);
                                    if (!shouldDelete)
                                        return;
                                    DeleteCircuitRemote(circuit.id);
                                }} />)
                    )}
                </div>
                <h4 unselectable="on">Examples</h4>
                <div>
                    {exampleCircuits.map((example, i) =>
                        (<CircuitPreview
                            key={`sidenav-example-circuit-${i}`}
                            data={example}
                            readonly
                            onDelete={() => { /* Do nothing */ }}
                            onClick={async () => {
                                if (loading) // Don't load another circuit if already loading
                                    return;
                                await LoadCircuit(LoadExampleCircuit(example));
                                dispatch(ToggleSideNav());
                            }} />)
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
