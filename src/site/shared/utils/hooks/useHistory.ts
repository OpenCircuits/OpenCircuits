import {useEffect, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";


export const useHistory = (info: CircuitInfo) => {
    const [state, setState] = useState({
        undoHistory: [] as Action[],
        redoHistory: [] as Action[],
    });

    useEffect(() => {
        const onHistoryChange = () => {
            setState({
                undoHistory: info.history.getActions(),
                redoHistory: info.history.getRedoActions(),
            });
        }

        info.history.addCallback(onHistoryChange);

        return () => info.history.removeCallback(onHistoryChange);
    }, [info, setState]);

    return state;
}
