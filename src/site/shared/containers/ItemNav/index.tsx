import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {SharedAppState} from "shared/state";
import {ToggleItemNav} from "shared/state/ItemNav/actions";

import {useHistory} from "shared/utils/hooks/useHistory";
import {Draggable} from "shared/components/DragDroppable/Draggable";
import { DragDropHandlers } from "shared/components/DragDroppable/DragDropHandlers";

import "./index.scss";
import {useDocEvent} from "shared/utils/hooks/useDocEvent";


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

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [{curItemID, numClicks}, setState] = useState({curItemID: "", numClicks: 1});

    // Resets the curItemID and numClicks
    function reset() {
        setState({curItemID: "", numClicks: 1});
    }

    // Drop the current item on click
    useDocEvent("click", (ev) => {
        DragDropHandlers.drop(V(ev.x, ev.y), curItemID, numClicks);
        reset();
    }, [curItemID, numClicks, setState]);

    // Reset `numClicks` and `curItemID` when something is dropped
    useEffect(() => {
        DragDropHandlers.addListener(reset);
        return () => DragDropHandlers.removeListener(reset);
    }, [setState]);

    return (
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            <div className="itemnav__top">
                <div>
                    {/* History box button goes here */}
                </div>
                <div>
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
                <div>
                    { // Hide tab if the circuit is locked
                    (isEnabled && !isLocked) &&
                        <div className={`itemnav__tab ${isOpen ? "" : "itemnav__tab__closed"}`}
                             title="Circuit Components"
                             onClick={() => toggle()}>
                            <div></div>
                        </div>
                    }
                </div>
            </div>
            <div className="itemnav__sections">
                {config.sections.map((section, i) =>
                    <div key={`itemnav-section-${i}`}>
                        <h4>{section.label}</h4>
                        <div>
                            {section.items.map((item, j) =>
                                <Draggable key={`itemnav-section-${i}-item-${j}`}
                                           data={[item.id, numClicks]}
                                           onClick={(ev) => {
                                               setState({
                                                   curItemID: item.id,
                                                   numClicks: (item.id === curItemID ? numClicks+1 : 1)
                                               });
                                               // Prevents `onClick` listener of placing the component to fire
                                               ev.stopPropagation();
                                           }}
                                           onDragChange={(d) => {
                                               // For instance, if user clicked on Button 4 times then dragged the
                                               //  Switch, we want to reset the numClicks to 1
                                               if (curItemID && item.id !== curItemID)
                                                   reset();
                                           }}>
                                    <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                                    <br />
                                    {item.label}
                                </Draggable>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
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
