import {Schema} from "shared/api/circuit/schema";

import {OVERWRITE_CIRCUIT_MESSAGE}            from "shared/site/utils/Constants";
import {useAPIMethods}                        from "shared/site/utils/ApiMethods";
import {CircuitHelpers}                       from "shared/site/utils/CircuitHelpers";
import {Request}                              from "shared/site/utils/Request";
import {setCurDesigner, useCurDesigner}       from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {ToggleSideNav} from "shared/site/state/SideNav";

import {CircuitPreview} from "shared/site/components/CircuitPreview";
import {Overlay}        from "shared/site/components/Overlay";

import {SignInOutButtons} from "shared/site/containers/Header/Right/SignInOutButtons";

import "./index.scss";


function LoadExampleCircuit(data: Schema.CircuitMetadata): Promise<string> {
    return Request({
        method:  "GET",
        url:     `/examples/${data.id}`,
        headers: {},
    });
}

type Props = {
    exampleCircuits: Schema.CircuitMetadata[];
}
export const SideNav = ({ exampleCircuits }: Props) => {
    const designer = useCurDesigner();

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
    const { LoadCircuit, LoadCircuitRemote, DeleteCircuitRemote } = useAPIMethods(designer.circuit);

    const onReset = () => {
        const open = isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;
        // Create a new designer
        setCurDesigner(CircuitHelpers.CreateAndInitializeDesigner());
        dispatch(ToggleSideNav());
    }
    const onUserCircuitClick = async (metadata: Schema.CircuitMetadata) => {
        if (loading) // Don't load another circuit if already loading
            return;
        if (!auth)
            throw new Error("Sidenav failed: auth is undefined");
        const open = isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;
        await LoadCircuitRemote(metadata.id);
        dispatch(ToggleSideNav());
    }
    const onUserCircuitDeleteClick = async (metadata: Schema.CircuitMetadata) => {
        if (loading) // Don't let user delete circuit while loading
            return;
        const shouldDelete = window.confirm(
            `Are you sure you want to delete circuit "${metadata.name}"?`);
        if (!shouldDelete)
            return;
        DeleteCircuitRemote(metadata.id);
    }
    const onExampleCircuitClick = async (metadata: Schema.CircuitMetadata) => {
        if (loading) // Don't load another circuit if already loading
            return;
        const open = isSaved && window.confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;
        await LoadCircuit(LoadExampleCircuit(metadata));
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
                                onClick={() => onUserCircuitClick(circuit)}
                                onDelete={() => onUserCircuitDeleteClick(circuit)} />)
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
                            onClick={async () => onExampleCircuitClick(example)} />)
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
