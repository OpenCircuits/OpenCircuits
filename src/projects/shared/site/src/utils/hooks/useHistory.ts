import {Circuit, CircuitHistoryEntry} from "shared/api/circuit/public";
import {useEffect, useState} from "react";


export const useHistory = (circuit: Circuit) => {
    const [state, setState] = useState<{ undoHistory: readonly CircuitHistoryEntry[], redoHistory: readonly CircuitHistoryEntry[] }>({
        undoHistory: [],
        redoHistory: [],
    });

    useEffect(() => circuit.history.subscribe(() => {
        setState({
            undoHistory: circuit.history.getUndoStack(),
            redoHistory: circuit.history.getRedoStack(),
        });
    }), [circuit, setState]);

    return state;
}
