import {useEffect, useState} from "react";

import {RIGHT_MOUSE_BUTTON} from "core/utils/Constants";

import {V} from "Vector";
import {Clamp} from "math/MathUtils";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";
import {useMousePos} from "shared/utils/hooks/useMousePos";
import {useDocEvent} from "shared/utils/hooks/useDocEvent";
import {useHistory} from "shared/utils/hooks/useHistory";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {OpenItemNav, CloseItemNav, CloseHistoryBox, OpenHistoryBox} from "shared/state/ItemNav";

import {Draggable} from "shared/components/DragDroppable/Draggable";
import {DragDropHandlers} from "shared/components/DragDroppable/DragDropHandlers";

import "./index.scss";


export type ItemNavItem = {
    id: string;
    label: string;
    icon: string;
    removable?: boolean;
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
    onStart?: () => void;
    onFinish?: (cancelled: boolean) => void;
    onDelete: (section: ItemNavSection, item: ItemNavItem) => boolean;
    additionalPreview?: (data: D, curItemID: string) => React.ReactNode;
}
export const ItemNav = <D,>({ info, config, additionalData, onDelete, onStart, onFinish, additionalPreview }: Props<D>) => {
    const {isOpen, isEnabled, isHistoryBoxOpen} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const {undoHistory, redoHistory} = useHistory(info);

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [{curItemID, numClicks}, setState] = useState({curItemID: "", numClicks: 1});

    const [hovering, setHover] = useState("");

    // State to keep track of drag'n'drop preview current image
    const [curItemImg, setCurItemImg] = useState("");

    // Resets the curItemID and numClicks
    function reset(cancelled: boolean = false) {
        setState({curItemID: "", numClicks: 1});
        setCurItemImg("");
        onFinish && onFinish(cancelled);
    }
    // Drop the current item on click
    useDocEvent("click", (ev) => {
        DragDropHandlers.drop(V(ev.x, ev.y), curItemID, numClicks, additionalData);
        reset();
    }, [curItemID, numClicks, setState, additionalData]);

    // Reset `numClicks` and `curItemID` when something is dropped
    useEffect(() => {
        const resetListener = () => reset(false);

        DragDropHandlers.addListener(resetListener);
        return () => DragDropHandlers.removeListener(resetListener);
    }, [setState]);


    // Cancel placing when pressing escape
    useWindowKeyDownEvent("Escape", () => {
        reset(true);
    });

    // Also cancel on Right Click
    useDocEvent("contextmenu", (ev) => {
        if (curItemID && ev.button === RIGHT_MOUSE_BUTTON) {
            reset(true);
            ev.preventDefault();
            ev.stopPropagation();
        }
        // v-- Essentially increases priority for this event so we can cancel the context menu
    }, [curItemID], true);


    // Get mouse-position for drag-n-drop preview
    const pos = useMousePos();

    const MAX_STACK = 4;

    const additionalPreviewComp = (additionalPreview && additionalPreview(additionalData, curItemID));

    const {w, h} = useWindowSize();
    let sections = (w > 768 || w > h) ? config.sections : [];
    if (sections.length === 0) {
        let numPerSection = Math.floor(w / 100);
        config.sections.forEach(section => {
            let items = section.items.slice();
            let subSectionNum = 0;
            while (items.length > 0) {
                sections.push({
                    id: section.id + subSectionNum,
                    label: section.label,
                    items: items.slice(0, numPerSection),
                });
                items = items.slice(numPerSection);
                subSectionNum++;
            }
        });
    }

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
                <div key={`itemnav-preview-stack-${i}`}
                     style={{
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
        </div>
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            <div className="itemnav__top">
                <div>
                    <button  title="History" onClick={() => {
                        if (isHistoryBoxOpen) dispatch(CloseHistoryBox());
                        else dispatch(OpenHistoryBox());
                    }}>
                        <img src="img/icons/history.svg"></img>
                    </button>
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
            <div className={`itemnav__sections ${curItemImg ? "dragging" : ""}`}>
                {sections.map((section, i) =>
                    <div key={`itemnav-section-${i}`}>
                        <h4>{section.label}</h4>
                        <div>
                            {section.items.map((item, j) =>
                                <div onMouseEnter={() => {item.removable && setHover(item.id)}}
                                     onMouseLeave={() => {item.removable && setHover("")}}>
                                    <Draggable key={`itemnav-section-${i}-item-${j}`}
                                               data={[item.id, Math.max(numClicks,1), additionalData]}
                                               onClick={(ev) => {
                                                   setState({
                                                       curItemID: item.id,
                                                       numClicks: (item.id === curItemID ? numClicks+1 : 1),
                                                   });
                                                   setCurItemImg(`/${config.imgRoot}/${section.id}/${item.icon}`);
                                                   onStart && onStart();

                                                   // Prevents `onClick` listener of placing the component to fire
                                                   ev.stopPropagation();
                                               }}
                                               onDragChange={(d) => {
                                                   // Set image if user started dragging on this item
                                                   if (d === "start") {
                                                           // For instance, if user clicked on Button 4 times then dragged the
                                                           //  Switch, we want to reset the numClicks to 1
                                                       setState({
                                                           curItemID: item.id,
                                                           numClicks: (item.id === curItemID ? numClicks : 0),
                                                       });
                                                       setCurItemImg(`/${config.imgRoot}/${section.id}/${item.icon}`);
                                                       onStart && onStart();
                                                   }
                                               }}>
                                        <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                                    </Draggable>
                                    {
                                        (item.removable && hovering === item.id) &&
                                        <div onClick={(ev) => {
                                            // Resets click tracking and stops propgation so that an
                                            // Components are not clicked onto the canvas after being deleted.
                                            setState({curItemID: "",
                                                        numClicks: 1});
                                            // Stops drag'n'drop preview when deleting
                                            setCurItemImg("");
                                            onDelete(section, item) && setHover("");

                                            ev.stopPropagation();
                                        }}>
                                            X
                                        </div>
                                    }
                                    <br />
                                    {item.label}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    </>);
}
