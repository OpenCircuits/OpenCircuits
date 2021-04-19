import React, { useEffect, useState } from "react";
import {connect} from "react-redux";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {SharedAppState} from "shared/state";
import {ToggleItemNav} from "shared/state/ItemNav/actions";

import {useHistory} from "shared/utils/hooks/useHistory";
import {Draggable} from "shared/components/DragDroppable/Draggable";
import {V} from "Vector";
import { DragDropHandlers } from "shared/components/DragDroppable/DragDropHandlers";

import "./index.scss";


export type ItemNavItem = {
    id: string;
    label: string;
    icon: string;
}
export type ItemNavSection = {
    id: string;
    label: string;
    items: ItemNavItem[];
}
export type ItemNavConfig = {
    imgRoot: string;
    sections: ItemNavSection[];
}


type OwnProps = {
    info: CircuitInfo;
    config: ItemNavConfig;
}
type StateProps = {
    isOpen: boolean;
    isEnabled: boolean;
    isLocked: boolean;
}
type DispatchProps = {
    toggle: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;

function _ItemNav({ info, config, isOpen, isEnabled, isLocked, toggle }: Props) {
    const {undoHistory, redoHistory} = useHistory(info);
    
    const [{currItemID, numClicks}, setState] = useState({currItemID: "", numClicks: 0});
    useEffect( () => {
        function handleClick(ev: MouseEvent) {
            // dont do anything if icons are clicked
            if ((ev.target as Element).tagName === "IMG") return;
            if (currItemID !== "" && (ev.target as Element).tagName === "CANVAS") {
                for (var i = 0; i < numClicks; i++) {
                    DragDropHandlers.drop(V(ev.clientX, ev.clientY + (i )), currItemID);
                }
            }
            // revert back to original state
            setState({currItemID: "", numClicks: 0});
        }
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        }
    }, [currItemID, numClicks, setState]);

    return (<>
        { // Hide tab if the circuit is locked
        (isEnabled && !isLocked) &&
            <>
                <div className={`tab ${isOpen ? "tab__closed" : ""}`}
                     title="Circuit Components"
                     onClick={() => toggle()}></div>
            </>
        }
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            <div className="itemnav__top">
                <div className="itemnav__top__history__buttons">
                    <button title="Undo"
                            disabled={undoHistory.length === 0}
                            onClick={() => info.history.undo() }>
                        <img src="img/icons/undo.svg" alt="" />
                    </button>
                    <button title="Redo"
                            disabled={redoHistory.length === 0}
                            onClick={() => info.history.redo() }>
                        <img src="img/icons/redo.svg" alt="" />
                    </button>
                </div>
            </div>
            {config.sections.map((section, i) =>
                <React.Fragment key={`itemnav-section-${i}`}>
                    <h4>{section.label}</h4>
                    {section.items.map((item, j) =>
                        <Draggable key={`itemnav-section-${i}-item-${j}`}
                                   data={item.id}>
                            <button 
                                onClick={() => {currItemID === item.id ? 
                                    setState({currItemID: currItemID, numClicks: numClicks + 1}) :
                                    setState({currItemID: item.id, numClicks: 1}); 
                                }}>
                                <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                                <br />
                                {item.label}
                            </button>
                        </Draggable>
                    )}
                </React.Fragment>
            )}
        </nav>
    </>);
}


const MapState = (state: SharedAppState) => ({
    isLocked: state.circuit.isLocked,
    isEnabled: state.itemNav.isEnabled,
    isOpen: state.itemNav.isOpen
});
const MapDispatch = {
    toggle: ToggleItemNav
};

export const ItemNav = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    MapState,
    MapDispatch
)(_ItemNav);
