import "./index.scss";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {connect} from "react-redux";
import {SharedAppState} from "shared/state";

type OwnProps = {
    undoImg: string;
    redoImg: string;
    info: CircuitInfo;
}

type StateProps = {
    isLocked: boolean;
}
type DispatchProps = {}

type Props = StateProps & DispatchProps & OwnProps;
const _UndoRedoButtons = ({info, undoImg, redoImg, isLocked}: Props) => {
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
            <button title="Undo" onClick={() => doFunc(onUndo)}> <img className="Undo_Logo" src={undoImg}  alt="" /></button>
            <button title="Redo" id="rightmost" onClick={() => doFunc(onRedo)}> <img className="Redo_Logo" src={redoImg}  alt="" /></button>
        </div>
    );
}

export const UndoRedoButtons = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLocked: state.circuit.isLocked }),
    { }
)(_UndoRedoButtons);

