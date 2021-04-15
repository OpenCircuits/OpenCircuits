import {useEffect, useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";


export const useHistory = (info: CircuitInfo) => {
    const [state, setState] = useState({ undoHistory: [], redoHistory: [] });

    useEffect(() => {
        const onHistoryChange = () => {
            setState({
                undoHistory: info.history.getActions(),
                redoHistory: info.history.getRedoActions()
            });
        }

        info.history.addCallback(onHistoryChange);

        return () => info.history.removeCallback(onHistoryChange);
    }, [info, setState]);

    return state;
}
