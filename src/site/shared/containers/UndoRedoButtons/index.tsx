import "./index.scss";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {connect} from "react-redux";
import {SharedAppState} from "shared/state";

type OwnProps = {
    info: CircuitInfo;
}

type StateProps = {
    isLocked: boolean;
}
type DispatchProps = {}

type Props = StateProps & DispatchProps & OwnProps;
const _UndoRedoButtons = ({info, isLocked}: Props) => {
    const {history} = info;

    const doFunc = (func: () => void) => {
        // Don't do anything if locked
        func();
    }

    /* "Undo/Redo" */
    const onUndo = async () => history.undo();
    const onRedo = async () => history.redo();


    return (
        <div className="UndoRedo">
            <button title="Undo" onClick={() => doFunc(onUndo)}>Undo</button>
            <button title="Redo" id="rightmost" onClick={() => doFunc(onRedo)}>Redo</button>
        </div>
    );
}

export const UndoRedoButtons = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLocked: state.circuit.isLocked }),
    { }
)(_UndoRedoButtons);

