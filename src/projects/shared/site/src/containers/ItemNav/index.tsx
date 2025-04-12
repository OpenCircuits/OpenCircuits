import {GUID}                                                       from "shared/api/circuit/public";
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";

import {ITEMNAV_HEIGHT, ITEMNAV_WIDTH} from "shared/site/utils/Constants";
import {RIGHT_MOUSE_BUTTON}            from "shared/api/circuitdesigner/input/Constants";

import {V, Vector} from "Vector";

import {Clamp} from "math/MathUtils";

import type {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {useDocEvent}           from "shared/site/utils/hooks/useDocEvent";
import {useHistory}            from "shared/site/utils/hooks/useHistory";
import {useKey}                from "shared/site/utils/hooks/useKey";
import {useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";
import {useMousePos}           from "shared/site/utils/hooks/useMousePos";
import {useSharedDispatch,
        useSharedSelector}     from "shared/site/utils/hooks/useShared";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import {SetCurPressedObjID}                                                     from "shared/site/state/CircuitInfo";
import {CloseHistoryBox, CloseItemNav, OpenHistoryBox, OpenItemNav, SetCurItem} from "shared/site/state/ItemNav";

import {DragDropHandlers} from "shared/site/components/DragDroppable/DragDropHandlers";
import {Draggable}        from "shared/site/components/DragDroppable/Draggable";

// TODO: Should be able to drive desktop width off of the value in _constants.scss but it isn't working
// import styles from "./index.scss";
import "./index.scss";
const DESKTOP_WIDTH = 768;


export type ItemNavItem = {
    kind: string;
    label: string;
    icon: string;
    removable?: boolean;
}
export type ItemNavSection = {
    kind: string;
    label: string;
    items: ItemNavItem[];
}
export type ItemNavConfig = {
    imgRoot: string;
    sections: ItemNavSection[];
}


type Props<D> = {
    designer: CircuitDesigner;
    config: ItemNavConfig;
    additionalData?: D;
    getImgSrc: (id: GUID) => string;
    onStart?: () => void;
    onFinish?: (cancelled: boolean) => void;
    onDelete?: (section: ItemNavSection, item: ItemNavItem) => boolean;
    additionalPreview?: (data: D, curItemID: string) => React.ReactNode;
}
export const ItemNav = <D,>({ designer, config, additionalData, onDelete, getImgSrc,
                              onStart, onFinish, additionalPreview }: Props<D>) => {
    const circuit = designer.circuit;
    const { isOpen, isEnabled, isHistoryBoxOpen, curPressedObjID } = useSharedSelector(
        (state) => ({ ...state.itemNav, curPressedObjID: state.circuit.curPressedObjID })
    );
    const dispatch = useSharedDispatch();

    const { w, h } = useWindowSize();
    const side = (w > Number(DESKTOP_WIDTH) || w > h) ? "left" : "bottom";

    const { undoHistory, redoHistory } = useHistory(circuit);

    // State to keep track of the number of times an item is clicked
    //  in relation to https://github.com/OpenCircuits/OpenCircuits/issues/579
    const [curItemState, setCurItemState] = useState({
        numClicks:  1,
        curItemID:  "",
        curItemImg: undefined as string | undefined,
    });

    // Keep in-sync with global state
    useLayoutEffect(() => {
        SetCurItem(curItemState.curItemID);
    }, [curItemState.curItemID]);

    // Track whether mouse is over entire ItemNav
    const [hoveringNav, setHoveringNav] = useState(false);

    const isShiftDown = useKey("Shift");

    // Delete the object if its dragged over to the ItemNav (issue #478)
    useDocEvent("mouseup",    () => dispatch(SetCurPressedObjID(undefined)));
    useDocEvent("mouseleave", () => dispatch(SetCurPressedObjID(undefined)));
    function handleItemNavDrag() { // Issue #478
        if (!curPressedObjID)
            return;
        const curPressedObj = circuit.getObj(curPressedObjID)!;
        if (curPressedObj.baseKind !== "Component")
            return;
        // If pressed object is part of selections, do a default deselect and delete of all selections
        if (curPressedObj.isSelected) {
            circuit.deleteObjs([...circuit.selections.components, ...circuit.selections.wires]);
            return;
        }
        // Else just delete
        circuit.deleteObjs([curPressedObj]);
    }

    // Resets the curItemID and numClicks
    const reset = useCallback((cancelled = false) => {
        setCurItemState({
            curItemID:  "",
            numClicks:  1,
            curItemImg: undefined,
        });
        onFinish?.(cancelled);
    }, [setCurItemState, onFinish]);

    // Drop the current item on click (or on touch end)
    useDocEvent("click", (ev) => {
        const { curItemID, numClicks } = curItemState;
        if (numClicks === 0) {
            reset();
            return;
        }
        // If holding shift then drop only a single item (issue #1043)
        if (isShiftDown && numClicks > 1) {
            DragDropHandlers.drop(V(ev.x, ev.y), curItemID, 1, additionalData);
            setCurItemState((state) => ({ ...state, numClicks: state.numClicks - 1 }));
            return;
        }
        // Otherwise drop all and reset
        DragDropHandlers.drop(V(ev.x, ev.y), curItemID, numClicks, additionalData);
        reset();
    }, [curItemState.curItemID, curItemState.numClicks, isShiftDown, additionalData, setCurItemState, reset]);
    useDocEvent("touchend", (ev) => {
        const touch = ev.changedTouches.item(0);
        if (!touch)
            throw new Error("ItemNav.useDocEvent failed: touch is null");
        const { clientX: x, clientY: y } = touch;
        DragDropHandlers.drop(V(x, y), curItemState.curItemID, curItemState.numClicks, additionalData);
        reset();
    }, [curItemState.curItemID, curItemState.numClicks, additionalData, reset]);

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
    }, [isShiftDown, reset]);

    // Updates camera margin when itemnav is open depending on size (Issue #656)
    useEffect(() => {
        designer.viewport.margin = (
            side === "left"
            ? { left: (isOpen ? ITEMNAV_WIDTH : 0), bottom: 0 }
            : { bottom: (isOpen ? ITEMNAV_HEIGHT : 0), left: 0 }
        );
    }, [designer, isOpen, side]);

    // Cancel placing when pressing escape
    useWindowKeyDownEvent("Escape", () => {
        reset(true);
    }, [reset]);

    // Also cancel on Right Click
    useDocEvent("contextmenu", (ev) => {
        if (curItemState.curItemID && ev.button === RIGHT_MOUSE_BUTTON) {
            reset(true);
            ev.preventDefault();
            ev.stopPropagation();
        }
        // v-- Essentially increases priority for this event so we can cancel the context menu
    }, [curItemState.curItemID, reset], true);

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
                .map<ItemNavSection>((items) => ({ kind: section.kind, label: section.label, items })),
        ], [] as ItemNavSection[]);
    }, [config.sections, w]);

    const sections = (side === "left") ? config.sections : sectionsBottom;

    // Get image for deletion preview (PR #1047)
    const deleteImg = useMemo(() => {
        // If not pressing a Component or not hovering the ItemNav, then returned undefined
        if (!hoveringNav || !curPressedObjID)
            return;
        const obj = circuit.getObj(curPressedObjID)!;
        if (obj.baseKind !== "Component")
            return;
        return getImgSrc(curPressedObjID);
    }, [circuit, curPressedObjID, hoveringNav, getImgSrc]);

    return (<>
        {/* Item Nav Deletion Preview (PR #1047) */}
        <ItemNavDeletionPreview deleteImg={deleteImg} />

        {/* Item Nav Currently Placing Preview */}
        <ItemNavItemPreview {...curItemState}
                            additionalData={additionalData}
                            additionalPreview={additionalPreview} />

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
                                onClick={() => circuit.undo()}>
                            <img src="img/icons/undo.svg" alt="" />
                        </button>
                        <button type="button"
                                title="Redo"
                                disabled={redoHistory.length === 0}
                                onClick={() => circuit.redo()}>
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
            <div className={`itemnav__sections ${curItemState.curItemImg ? "dragging" : ""}`}>
                {sections.map((section, i) =>
                    (<div key={`itemnav-section-${i}`}>
                        <h4>{section.label}</h4>
                        <div>
                            {section.items.map((item, j) => (
                                <ItemNavButton
                                    key={`itemnav-section-${i}-item-${j}`}
                                    additionalData={additionalData}
                                    section={section}
                                    item={item}
                                    dragDir={(side === "left") ? "horizontal" : "vertical"}
                                    numClicks={curItemState.numClicks}
                                    itemImgPath={`/${config.imgRoot}/${section.kind}/${item.icon}`}
                                    setCurItemState={setCurItemState}
                                    onStart={onStart}
                                    onDelete={onDelete} />))}
                        </div>
                    </div>)
                )}
            </div>
        </nav>
    </>);
}


type ItemNavDeletionPreviewProps = {
    deleteImg?: string;
}
const ItemNavDeletionPreview = ({ deleteImg }: ItemNavDeletionPreviewProps) => {
    const pos = useMousePos();

    if (!deleteImg)
        return null;

    // Item Nav Deletion Preview (PR #1047)
    return (
        <div className="itemnav__preview"
             style={{
                 display: "initial",
                 left:    pos.x,
                 top:     pos.y,
             }}>
            {/* config.imgRoot / section.id / item.icon */}
            <img src={deleteImg} alt="Deletion Preview" width="80px" />
        </div>
    );
}


type ItemNavItemPreviewProps<D> = {
    curItemID: string;
    numClicks: number;
    curItemImg: string | undefined;
    additionalData?: D;
    additionalPreview?: (data: D, curItemID: string) => React.ReactNode;
}
const ItemNavItemPreview = <D,>({ curItemID, numClicks, curItemImg, additionalData,
                                   additionalPreview }: ItemNavItemPreviewProps<D>) => {
    const MAX_STACK = 4;

    const pos = useMousePos();

    const additionalPreviewComp = (additionalPreview && !!additionalData &&
                                   additionalPreview(additionalData, curItemID));

    return (
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
    );
}


type ItemProps<D> = {
    section: ItemNavSection;
    item: ItemNavItem;
    itemImgPath: string;
    numClicks: number;
    dragDir: "horizontal" | "vertical";
    additionalData?: D;
    setCurItemState: React.Dispatch<React.SetStateAction<{
        numClicks: number;
        curItemID: string;
        curItemImg: string | undefined;
    }>>;
    onStart?: () => void;
    onDelete?: (section: ItemNavSection, item: ItemNavItem) => boolean;
}
const ItemNavButton = <D,>({ section, item, itemImgPath, numClicks, dragDir, additionalData,
                              setCurItemState, onStart, onDelete }: ItemProps<D>) => {
    // Track whether mouse is over this item
    const [hovering, setHovering] = useState(false);

    const onClick = useCallback((ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setCurItemState((prevState) => ({
            curItemID:  item.kind,
            curItemImg: itemImgPath,
            numClicks:  (prevState.curItemID === item.kind ? prevState.numClicks+1 : 1),
        }));
        onStart?.();

        // Prevents `onClick` listener of placing the component to fire
        ev.stopPropagation();
    }, [item.kind, itemImgPath, setCurItemState, onStart]);

    const onDragChange = useCallback((d: "start" | "end") => {
        // Set image if user started dragging on this item
        if (d === "start") {
            // For instance, if user clicked on Button 4 times then dragged the
            //  Switch, we want to reset the numClicks to 1
            setCurItemState((prevState) => ({
                curItemID:  item.kind,
                curItemImg: itemImgPath,
                numClicks:  (prevState.curItemID === item.kind ? prevState.numClicks : 0),
            }));
            onStart?.();
        }
    }, [item.kind, itemImgPath, setCurItemState, onStart]);

    const onTouchEnd = useCallback((ev: React.TouchEvent<HTMLButtonElement>) => {
        // Prevents the `touchend` listener of placing the component to fire
        ev.stopPropagation();
    }, []);

    const onRemove = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // Resets click tracking and stops propgation so that an
        // Components are not clicked onto the canvas after being deleted.
        setCurItemState({
            curItemID:  "",
            numClicks:  1,
            // Stops drag'n'drop preview when deleting
            curItemImg: undefined,
        });
        onDelete?.(section, item);
        setHovering(true);

        ev.stopPropagation();
    }, [section, item, setCurItemState, setHovering, onDelete]);

    const data = useMemo(
        () => [item.kind, Math.max(numClicks, 1), additionalData],
        [item.kind, numClicks, additionalData]);

    return (
        <div role="button" tabIndex={0}
             onMouseEnter={() => {item.removable && setHovering(true)}}
             onMouseLeave={() => {item.removable && setHovering(false)}}>
            <Draggable
                dragDir={dragDir}
                data={data}
                onClick={onClick}
                onDragChange={onDragChange}
                onTouchEnd={onTouchEnd}>
                <img src={itemImgPath} alt={item.label} />
            </Draggable>
            {
                (item.removable && hovering) && (
                    <div role="button" tabIndex={0} onClick={onRemove}>
                        X
                    </div>)
            }
            <br />
            {item.label}
        </div>
    );
}
