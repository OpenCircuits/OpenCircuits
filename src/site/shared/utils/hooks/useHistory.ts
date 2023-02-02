import {Circuit}             from "core/public";
import {useEffect, useState} from "react";


interface Action {}


export const useHistory = (circuit: Circuit) => {
    const [state, setState] = useState({
        undoHistory: [] as Action[],
        redoHistory: [] as Action[],
    });

    useEffect(() => {
        const onHistoryChange = () => {
            // setState({
            //     undoHistory: info.history.getActions(),
            //     redoHistory: info.history.getRedoActions(),
            // });
        }

        // info.history.addCallback(onHistoryChange);

        // return () => info.history.removeCallback(onHistoryChange);
    }, [circuit, setState]);

    return state;
}
