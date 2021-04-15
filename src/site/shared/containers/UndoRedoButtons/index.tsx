import {connect} from "react-redux";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {useHistory} from "shared/utils/hooks/useHistory";
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
const _UndoRedoButtons = ({info, undoImg, redoImg, isLocked}: Props) => {
    const {undoHistory, redoHistory} = useHistory(info);

    return (
        <div className="undoredo__buttons">
            <button title="Undo"
                    disabled={undoHistory.length === 0}
                    onClick={() => { if (!isLocked) info.history.undo(); }}>
                <img src={undoImg} alt="" />
            </button>
            <button title="Redo"
                    disabled={redoHistory.length === 0}
                    onClick={() => { if (!isLocked) info.history.redo(); }}>
                <img src={redoImg} alt="" />
            </button>
        </div>
    );
}

export const UndoRedoButtons = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLocked: state.circuit.isLocked }),
    { }
)(_UndoRedoButtons);
