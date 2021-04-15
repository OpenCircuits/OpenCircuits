import {connect} from "react-redux";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {SharedAppState} from "shared/state";

import "./index.scss";


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
const _UndoRedoButtons = ({info, undoImg, redoImg, isLocked}: Props) => (
    <div className="undoredo__buttons">
        <button title="Undo" onClick={() => { if (!isLocked) info.history.undo(); }}><img src={undoImg} alt="" /></button>
        <button title="Redo" onClick={() => { if (!isLocked) info.history.redo(); }}><img src={redoImg} alt="" /></button>
    </div>
);

export const UndoRedoButtons = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLocked: state.circuit.isLocked }),
    { }
)(_UndoRedoButtons);

