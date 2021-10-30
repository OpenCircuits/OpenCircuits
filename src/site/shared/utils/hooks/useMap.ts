import {useReducer} from "react";


interface clearAction {
    type: "clear"
}

export const useMap = <K, V>(map: Map<K, V>): [Map<K, V>, (key: K, value: V) => void, (key: K) => void, () => void] => {
    interface setAction {
        type: "set",
        key: K,
        value: V
    }
    interface deleteAction {
        type: "del",
        key: K
    }
    type action = clearAction | setAction | deleteAction;

    function reducer(map: Map<K, V>, action: action) {
        if (action.type === "clear")
            return new Map<K, V>();
        const newMap = new Map(map);
        if (action.type === "set")
            newMap.set(action.key, action.value);
        else if (action.type === "del")
            newMap.delete(action.key);
        return newMap;
    }
    const [state, dispatch] = useReducer(reducer, map);

    const set = (key: K, value: V) => dispatch({type: "set", key: key, value: value});
    const del = (key: K) => dispatch({type: "del", key: key});
    const clear = () => dispatch({type: "clear"});

    return [state, set, del, clear];
}
