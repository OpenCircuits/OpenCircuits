import {Circuit}             from "shared/api/circuit/public";
import {useEffect, useState} from "react";
import {LogEntry} from "shared/api/circuit/internal/impl/CircuitLog";


export const useHistory = (circuit: Circuit) => {
    const [state, setState] = useState<{ undoHistory: readonly LogEntry[], redoHistory: readonly LogEntry[] }>({
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
