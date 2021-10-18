import {useEffect, useState} from "react";
import {V} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useMousePos} from "shared/utils/hooks/useMousePos";
import {useDocEvent} from "shared/utils/hooks/useDocEvent";
import {useHistory} from "shared/utils/hooks/useHistory";

import {OpenItemNav, CloseItemNav} from "shared/state/ItemNav";

import {Draggable} from "shared/components/DragDroppable/Draggable";
import {DragDropHandlers} from "shared/components/DragDroppable/DragDropHandlers";

import "./index.scss";
import {Clamp} from "math/MathUtils";


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

type Props<D> = {
    info: CircuitInfo;
    config: ItemNavConfig;
    additionalData?: D;
    additionalPreview?: (data: D, curItemID: string) => React.ReactNode;
    children?: React.ReactNode;
}
export const ItemNav = <D,>({ info, config, additionalData, additionalPreview, children }: Props<D>) => {
    const {isOpen, isEnabled} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const {undoHistory, redoHistory} = useHistory(info);

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [{curItemID, numClicks}, setState] = useState({curItemID: "", numClicks: 1});

    // State to keep track of drag'n'drop preview current image
    const [curItemImg, setCurItemImg] = useState("");


    // Resets the curItemID and numClicks
    function reset() {
        setState({curItemID: "", numClicks: 1});
        setCurItemImg("");
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

    // Get mouse-position for drag-n-drop preview
    const pos = useMousePos();

    const MAX_STACK = 4;

    const additionalPreviewComp = (additionalPreview && additionalPreview(additionalData, curItemID));

    return (<>
        <div className="itemnav__preview"
             style={{
                display: (curItemImg ? "initial" : "none"),
                left: pos.x,
                top: pos.y,
             }}>
            <img src={curItemImg} width="80px" />
            {additionalPreviewComp}
            {Array(Clamp(numClicks-1, 0, MAX_STACK-1)).fill(0).map((_, i) => (
                <div style={{
                    position: "absolute",
                    left: (i+1)*5,
                    top: (i+1)*5,
                    zIndex: 100-(i+1),
                }}>
                    <img src={curItemImg} width="80px" />
                    {additionalPreviewComp}
                </div>
            ))}
            <span style={{ display: (numClicks > MAX_STACK ? "initial" : "none") }}>
                x{numClicks}
            </span>
            {/* {children} */}
        </div>
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            <div className="itemnav__top">
                <div>
                    {/* History box button goes here */}
                </div>
                <div>
                    <div className="itemnav__top__history__buttons">
                        <button title="Undo"
                                disabled={undoHistory.length === 0}
                                onClick={() => {
                                    info.history.undo();
                                    info.renderer.render(); // Re-render
                                }}>
                            <img src="img/icons/undo.svg" alt="" />
                        </button>
                        <button title="Redo"
                                disabled={redoHistory.length === 0}
                                onClick={() => {
                                    info.history.redo();
                                    info.renderer.render(); // Re-render
                                 }}>
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
                            {section.items.map((item, j) =>
                                <Draggable key={`itemnav-section-${i}-item-${j}`}
                                           data={[item.id, numClicks]}
                                           onClick={(ev) => {
                                               setState({
                                                   curItemID: item.id,
                                                   numClicks: (item.id === curItemID ? numClicks+1 : 1),
                                               });
                                               setCurItemImg(`/${config.imgRoot}/${section.id}/${item.icon}`);

                                               // Prevents `onClick` listener of placing the component to fire
                                               ev.stopPropagation();
                                           }}
                                           onDragChange={(d) => {
                                               // For instance, if user clicked on Button 4 times then dragged the
                                               //  Switch, we want to reset the numClicks to 1
                                               if (curItemID && item.id !== curItemID)
                                                   reset();

                                               // Set image if user started dragging on this item
                                               if (d === "start")
                                                   setCurItemImg(`/${config.imgRoot}/${section.id}/${item.icon}`);
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
    </>);
}
