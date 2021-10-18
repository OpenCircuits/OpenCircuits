import {useEffect, useState} from "react";
import {Dispatch} from "redux";
import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {SharedAppState} from "shared/state";
import {AllSharedActions} from "shared/state/actions";
import {OpenItemNav, CloseItemNav} from "shared/state/ItemNav";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useDocEvent} from "shared/utils/hooks/useDocEvent";
import {useHistory} from "shared/utils/hooks/useHistory";
import {Draggable} from "shared/components/DragDroppable/Draggable";
import {DragDropHandlers} from "shared/components/DragDroppable/DragDropHandlers";

import {IC} from "digital/models/ioobjects";
import {ICData} from "digital/models/ioobjects";
import {DigitalCircuitDesigner} from '../../../../app/digital/models/DigitalCircuitDesigner';
import {DeleteICDataAction} from '../../../../app/digital/actions/DeleteICDataAction';


import "./index.scss";


export type ItemNavItem = {
    id: string;
    label: string;
    icon: string;
    removable?: boolean;
    data?: ICData;
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

type Props = {
    info: CircuitInfo;
    config: ItemNavConfig;
}
export const ItemNav = ({ info, config }: Props) => {
    const {isOpen, isEnabled} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const {undoHistory, redoHistory} = useHistory(info);

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [{curItemID, numClicks}, setState] = useState({curItemID: "", numClicks: 1});
    const [hovering, setHover] = useState("")
    // Resets the curItemID and numClicks
    function reset() {
        setState({curItemID: "", numClicks: 1});
    }
    function deleteIC(sec: ItemNavSection, ic: ItemNavItem) {
        var designer: DigitalCircuitDesigner = info.designer as DigitalCircuitDesigner;
        var shouldDelete: boolean = true;

        info.designer.getAll().forEach(function (o) {
            if (o instanceof IC && o.getData() === ic.data){
                window.alert("Cannot delete this IC while instances remain in the circuit.");
                shouldDelete = false;
            }
        })
        if(shouldDelete){
            sec.items.splice(sec.items.indexOf(ic));
            info.history.add(new DeleteICDataAction(ic.data, designer).execute());
            setHover("");
        }
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
                    isEnabled &&
                        <div className={`itemnav__tab ${isOpen ? "" : "itemnav__tab__closed"}`}
                             title="Circuit Components"
                             onClick={() => dispatch(isOpen ? CloseItemNav() : OpenItemNav())}>
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
                            {section.items.map((item, j) => {
                                return <Draggable key={`itemnav-section-${i}-item-${j}`}
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


                                    <div
                                        onMouseEnter={() => { 
                                            if (item.removable) {setHover(item.id)}
                                        }}
                                        onMouseLeave={() => {
                                            if (item.removable) {setHover("")}
                                        }}>

                                        <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label}/>

                                        {
                                            (item.removable && hovering === item.id) &&
                                            <div onClick={(ev) => {
                                                deleteIC(section, item);

                                                // Resets click tracking and stops propgation so that an
                                                //  IC is not clicked onto the canvas after being deleted.
                                                setState({curItemID: "",
                                                          numClicks: 1});

                                                ev.stopPropagation();
                                            }}>X</div>
                                        }
                                        <br />

                                    </div>
                                    {item.label}
                                </Draggable>
                            }
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
