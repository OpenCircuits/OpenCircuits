import {useCallback, useEffect, useMemo, useState} from "react";

import {RIGHT_MOUSE_BUTTON}            from "core/utils/Constants";
import {ITEMNAV_HEIGHT, ITEMNAV_WIDTH} from "shared/utils/Constants";

import {V, Vector} from "Vector";

import {Clamp} from "math/MathUtils";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Selectable}  from "core/utils/Selectable";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeleteHandler} from "core/tools/handlers/DeleteHandler";

import {Component} from "core/models";

import {useDocEvent}           from "shared/utils/hooks/useDocEvent";
import {useHistory}            from "shared/utils/hooks/useHistory";
import {useKey}                from "shared/utils/hooks/useKey";
import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";
import {useMousePos}           from "shared/utils/hooks/useMousePos";
import {useSharedDispatch,
        useSharedSelector}     from "shared/utils/hooks/useShared";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {CloseHistoryBox, CloseItemNav, OpenHistoryBox, OpenItemNav, SetCurItem} from "shared/state/ItemNav";

import {DragDropHandlers} from "shared/components/DragDroppable/DragDropHandlers";
import {Draggable}        from "shared/components/DragDroppable/Draggable";

import styles from "./index.scss";


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
    getImgSrc: (c: Component) => string;
    onStart?: () => void;
    onFinish?: (cancelled: boolean) => void;
    onDelete?: (section: ItemNavSection, item: ItemNavItem) => boolean;
    additionalPreview?: (data: D, curItemID: string) => React.ReactNode;
}
export const ItemNav = <D,>({ info, config, additionalData, getImgSrc, onDelete,
                              onStart, onFinish, additionalPreview }: Props<D>) => {
    const { isOpen, isEnabled, isHistoryBoxOpen, curItemID } = useSharedSelector(
        (state) => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const { w, h } = useWindowSize();
    const side = (w > Number(styles.desktopWidth) || w > h) ? "left" : "bottom";

    const { undoHistory, redoHistory } = useHistory(info);

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [numClicks, setNumClicks] = useState(1);

    // Track whether mouse is over entire ItemNav
    const [hoveringNav, setHoveringNav] = useState(false);

    // Track whether mouse is over specific Items
    const [hovering, setHover] = useState("");

    const isShiftDown = useKey("Shift");

    // State to keep track of drag'n'drop preview current image
    const [curItemImg, setCurItemImg] = useState("");

    // Keep track of a separate 'currentlyPressedObj' in tandem with `info.currentlyPressedObj` so that
    //  we can use it to potentially delete the object if its dragged over to the ItemNav (issue #478)
    const [currentlyPressedObj, setCurPressedObj] = useState(undefined as (Selectable | undefined));
    useDocEvent("mousedown", () => {
         // Update currentlyPressedObj if the user pressed an object
        if (info.currentlyPressedObject)
            setCurPressedObj(info.currentlyPressedObject);
    });
    useDocEvent("mouseup",    () => setCurPressedObj(undefined));
    useDocEvent("mouseleave", () => setCurPressedObj(undefined));
    function handleItemNavDrag() { // Issue #478
        if (!currentlyPressedObj || !(currentlyPressedObj instanceof Component))
            return;
        // If pressed object is part of selections, do a default deselect and delete of all selections
        if (info.selections.has(currentlyPressedObj)) {
            DeleteHandler.getResponse(info);
            return;
        }
        // Else just delete
        info.history.add(DeleteGroup(info.designer, [currentlyPressedObj]));
    }

    // Resets the curItemID and numClicks
    const reset = useCallback((cancelled = false) => {
        dispatch(SetCurItem(""));
        setNumClicks(1);
        setCurItemImg("");
        onFinish?.(cancelled);
    }, [setNumClicks, setCurItemImg, onFinish, dispatch]);

    // Drop the current item on click (or on touch end)
    useDocEvent("click", (ev) => {
        // If holding shift then drop only a single item (issue #1043)
        if (isShiftDown && numClicks > 1) {
            DragDropHandlers.drop(V(ev.x, ev.y), curItemID, 1, additionalData);
            setNumClicks(numClicks - 1);
            return;
        }
        // Otherwise drop all and reset
        DragDropHandlers.drop(V(ev.x, ev.y), curItemID, numClicks, additionalData);
        reset();
    }, [curItemID, numClicks, isShiftDown, additionalData, setNumClicks, reset]);
    useDocEvent("touchend", (ev) => {
        const touch = ev.changedTouches.item(0);
        if (!touch)
            throw new Error("ItemNav.useDocEvent failed: touch is null");
        const { clientX: x, clientY: y } = touch;
        DragDropHandlers.drop(V(x,y), curItemID, numClicks, additionalData);
        reset();
    }, [curItemID, numClicks, setNumClicks, reset, additionalData]);

    // Reset `numClicks` and `curItemID` when something is dropped
    useEffect(() => {
        if (isShiftDown) // Don't reset on click if shift is down
            return;

        const resetListener = (_: Vector, hit: boolean) => {
            if (hit)
                reset(false);
        }

        DragDropHandlers.addListener(resetListener);
        return () => DragDropHandlers.removeListener(resetListener);
    }, [isShiftDown, setNumClicks, reset]);

    // Updates camera margin when itemnav is open depending on size (Issue #656)
    useEffect(() => {
        info.camera.setMargin(
            side === "left"
            ? { left: (isOpen ? ITEMNAV_WIDTH : 0), bottom: 0 }
            : { bottom: (isOpen ? ITEMNAV_HEIGHT : 0), left: 0 }
        );
    }, [info.camera, isOpen, side]);

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

    const additionalPreviewComp = (additionalPreview && !!additionalData &&
                                   additionalPreview(additionalData, curItemID));

    // Calculate alternate sections view for when the ItemNav is on the bottom of the screen
    //  By placing them all on a single row
    const sectionsBottom = useMemo(() => {
        // Utility reducer to reduce an array to groups of size `amt`
        //  i.e. [1,2,3,4,5,6,7].reduce(GroupBy(3),[[]])
        //     => [[1,2,3],[4,5,6],[7]]
        function GroupBy<T>(amt: number) {
            return ((prev: T[][], cur: T) => [
                ...prev.slice(0,-1),
                ...(prev.at(-1)!.length < amt
                    ? [[...prev.at(-1)!, cur]] // Add cur to last group
                    : [prev.at(-1)!, [cur]]),  // Create new group with just cur
            ]);
        }

        const H_MARGIN = 30, ITEM_WIDTH = 100;

        const numPerSection = Math.floor((w - H_MARGIN) / ITEM_WIDTH);
        return config.sections.reduce((prev, section) => [
            ...prev,
            ...section.items
                // Reduce items to group of `numPerSection`
                .reduce(GroupBy(numPerSection), [[]] as ItemNavItem[][])
                // Map each group to a new section with same ID and label
                .map<ItemNavSection>((items) => ({ id: section.id, label: section.label, items })),
        ], [] as ItemNavSection[]);
    }, [config.sections, w]);

    const sections = (side === "left") ? config.sections : sectionsBottom;

    // Get image for deletion preview (PR #1047)
    const deleteImg = useMemo(() => {
        // If not pressing a Component or not hovering the ItemNav, then returned undefined
        if (!(currentlyPressedObj instanceof Component) || !hoveringNav)
            return;
        return getImgSrc(currentlyPressedObj);
    }, [currentlyPressedObj, hoveringNav, getImgSrc]);

    return (<>
        {/* Item Nav Deletion Preview (PR #1047) */}
        {deleteImg && (
        <div className="itemnav__preview"
             style={{
                    display: "initial",
                    left:    pos.x,
                    top:     pos.y,
                }}>
            {/* config.imgRoot / section.id / item.icon */}
            <img src={deleteImg} alt="Deletion Preview" width="80px" />
        </div>
        )}

        {/* Item Nav Currently Placing Preview */}
        <div className="itemnav__preview"
             style={{
                 display: (curItemImg ? "initial" : "none"),
                 left:    pos.x,
                 top:     pos.y,
             }}>
            <img src={curItemImg} alt="Current item preview" width="80px" />
            {additionalPreviewComp}
            {new Array(Clamp(numClicks-1, 0, MAX_STACK-1)).fill(0).map((_, i) => (
                <div key={`itemnav-preview-stack-${i}`}
                     style={{
                         position: "absolute",
                         left:     (i+1)*5,
                         top:      (i+1)*5,
                         zIndex:   100-(i+1),
                     }}>
                    <img src={curItemImg} alt="Current item preview" width="80px" />
                    {additionalPreviewComp}
                </div>
            ))}
            <span style={{ display: (numClicks > MAX_STACK ? "initial" : "none") }}>
                x{numClicks}
            </span>
        </div>

        {/* Actual Item Nav */}
        <nav role="application"
             className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}
             onMouseOver={() => setHoveringNav(true)} onFocus={() => setHoveringNav(true)}
             onMouseLeave={() => setHoveringNav(false)} onBlur={() => setHoveringNav(false)}
             onMouseUp={handleItemNavDrag}>
            <div className="itemnav__top">
                <div>
                    <button type="button" title="History" onClick={() => {
                        if (isHistoryBoxOpen)
                            dispatch(CloseHistoryBox());
                        else
                            dispatch(OpenHistoryBox());
                    }}>
                        <img src="img/icons/history.svg" alt="Toggle history box"></img>
                    </button>
                </div>
                <div>
                    <div className="itemnav__top__history__buttons">
                        <button type="button"
                                title="Undo"
                                disabled={undoHistory.length === 0}
                                onClick={() => {
                                    info.history.undo();
                                    info.renderer.render(); // Re-render
                                }}>
                            <img src="img/icons/undo.svg" alt="" />
                        </button>
                        <button type="button"
                                title="Redo"
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
                        (<div role="button" tabIndex={0}
                              className={`itemnav__tab ${isOpen ? "" : "itemnav__tab__closed"}`}
                              title="Circuit Components"
                              onClick={() => dispatch(isOpen ? CloseItemNav() : OpenItemNav())}>
                            <div></div>
                        </div>)
                    }
                </div>
            </div>
            <div className={`itemnav__sections ${curItemImg ? "dragging" : ""}`}>
                {sections.map((section, i) =>
                    (<div key={`itemnav-section-${i}`}>
                        <h4>{section.label}</h4>
                        <div>
                            {section.items.map((item, j) => (
                                <div key={`itemnav-section-${i}-item-${j}`}
                                     role="button" tabIndex={0}
                                     onMouseEnter={() => {item.removable && setHover(item.id)}}
                                     onMouseLeave={() => {item.removable && setHover("")}}>
                                    <Draggable
                                        dragDir={(side === "left") ? "horizontal" : "vertical"}
                                        data={[item.id, Math.max(numClicks,1), additionalData]}
                                        onClick={(ev) => {
                                            dispatch(SetCurItem(item.id));
                                            setNumClicks(item.id === curItemID ? numClicks+1 : 1);
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
                                                dispatch(SetCurItem(item.id));
                                                setNumClicks(item.id === curItemID ? numClicks : 0);
                                                setCurItemImg(`/${config.imgRoot}/${section.id}/${item.icon}`);
                                                onStart && onStart();
                                            }
                                        }}
                                        onTouchEnd={(ev) => {
                                            // Prevents the `touchend` listener of placing the component to fire
                                            ev.stopPropagation();
                                        }}>
                                        <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                                    </Draggable>
                                    {
                                        (item.removable && hovering === item.id) && (
                                            <div role="button" tabIndex={0}
                                                 onClick={(ev) => {
                                                    // Resets click tracking and stops propgation so that an
                                                    // Components are not clicked onto the canvas after being deleted.
                                                    dispatch(SetCurItem(""));
                                                    setNumClicks(1);
                                                    // Stops drag'n'drop preview when deleting
                                                    setCurItemImg("");
                                                    if (onDelete)
                                                        onDelete(section, item);
                                                    setHover("");

                                                    ev.stopPropagation();
                                                 }}>
                                                X
                                            </div>
                                        )
                                    }
                                    <br />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>)
                )}
            </div>
        </nav>
    </>);
}


