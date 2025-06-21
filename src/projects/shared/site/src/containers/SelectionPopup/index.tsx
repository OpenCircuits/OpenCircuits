import {Obj}                                from "shared/api/circuit/public";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";

import {DOUBLE_CLICK_DURATION, HEADER_HEIGHT} from "shared/site/utils/Constants";

import {V} from "Vector";

import {Clamp} from "math/MathUtils";

import {useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {TitleModule}       from "./modules/TitleModule";
import {useSelectionProps} from "./modules/useSelectionProps";

import "./index.scss";
import {useEvent} from "shared/site/utils/hooks/useEvent";


type Props = {
    designer: CircuitDesigner;
    docsUrlConfig: Record<string, string>;
    children: React.ReactNode;
}
export const SelectionPopup = ({ designer, docsUrlConfig, children }: Props) => {
    const circuit = designer.circuit, viewport = designer.viewport;
    const itemNavCurItem = useSharedSelector((state) => state.itemNav.curItemID);

    const [numSelections, setNumSelections] = useState(0);
    const [pos, setPos] = useState(viewport.toScreenPos(circuit.selections.midpoint));
    const [isDragging, setIsDragging] = useState(false);
    const [clickThrough, setClickThrough] = useState(false);

    // When the contents of the popup change, because the selections change, this can cause the
    // SIZE of the popup to change depending on the selected contents.
    // Without this, when calculating the `finalPos` using bounding-client-rect, it will use
    // the size of the popup previously, since the popup hasn't re-rendered yet.
    // This variable helps bounce the popup by 1-call so that when the selections change, this
    // is set to true, the popup renders, the effect changes it to false, causing another render
    // which then allows the position to be properly calculated. See #1434.
    const [selectionsChanged, setSelectionsChanged] = useState(false);
    useLayoutEffect(() => {
        setSelectionsChanged(false);
    }, [selectionsChanged, setSelectionsChanged]);

    useEffect(() => {
        // Set it initially (like when new circuit is loaded)
        setNumSelections(circuit.selections.length);
        setPos(viewport.toScreenPos(circuit.selections.midpoint));
        setSelectionsChanged(true);

        return circuit.selections.subscribe(() => {
            setNumSelections(circuit.selections.length);
            setPos(viewport.toScreenPos(circuit.selections.midpoint));
            setSelectionsChanged(true);

            // When the selection changes, reset the clickThrough state and
            // let user click through box so it doesn't block a double click
            setClickThrough((prevState) => {
                if (prevState) // If already have a timeout then just ignore
                    return prevState;
                setTimeout(() =>
                    setClickThrough(false),
                    DOUBLE_CLICK_DURATION
                );
                return true;
            });
        });
    }, [circuit, viewport, setNumSelections, setClickThrough]);

    useEffect(() => viewport.camera.subscribe(() =>
        setPos(viewport.toScreenPos(circuit.selections.midpoint))
    ), [circuit, setPos]);
    // TODO[master] - Right now, the selection popup won't move when you edit
    //                the position values in the popup, this is kinda nice since
    //                it lets you easily edit multiple values in one-go, but it
    //                also feels a bit janky. Uncommenting this makes it work *okay*
    //                except when you switch from one input to another, it commits
    //                and it'll move which also feels jank.
    //                We can maybe make a smarter system that only commits events
    //                when nothing is in-focus, but that'll be a somewhat difficult task.
    // useEffect(() => circuit.history.subscribe(() =>
    //     setPos(viewport.toScreenPos(circuit.selections.midpoint))
    // ), [circuit, setPos]);

    useEvent("mousedrag", (_) => {
        setIsDragging(true); // Don't show popup if dragging
    }, designer.viewport.canvasInfo?.input, [setIsDragging]);
    useEvent("mouseup", (_) => {
        setIsDragging(false); // Show when stopped dragging
        setPos(viewport.toScreenPos(circuit.selections.midpoint)); // And recalculate position
    }, designer.viewport.canvasInfo?.input, [circuit, viewport, setPos, setIsDragging]);

    const popup = useRef<HTMLDivElement>(null);

    const isVisible = (numSelections > 0 && !isDragging && !selectionsChanged);

    // Clamp position to screen if visible
    const finalPos = (() => {
        if (!isVisible)
            return pos;
        if (!popup.current)
            throw new Error("SelectionPopup failed: popup.current is null");
        const { width, height } = popup.current.getBoundingClientRect();

        return V(
            Clamp(pos.x, 0, window.innerWidth - width),
            // Since the Selection Popup has a transform (0, -50%), this `y` position is the
            //  y position of the middle of it, not the top
            Clamp(pos.y, height/2, window.innerHeight - HEADER_HEIGHT - height/2)
        );
    })();

    return (
        <div ref={popup}
             className="selection-popup"
             tabIndex={-1}
             style={{
                left:          `${finalPos.x}px`,
                top:           `${finalPos.y}px`,
                visibility:    (isVisible ? "visible": "hidden"),
                // Fixes issue with double clicks and when dragging from the ItemNav
                //  Issues #521 and #863 respectively
                pointerEvents: (clickThrough || !!itemNavCurItem ? "none" : "auto"),
             }}>
            <InfoDisplay designer={designer} docsUrlConfig={docsUrlConfig} />
            <TitleModule designer={designer}  />
            <hr />
            {children}
        </div>
    );
}


type InfoDisplayProps = {
    designer: CircuitDesigner;
    docsUrlConfig: Record<string, string>;
}
const InfoDisplay = ({ designer, docsUrlConfig }: InfoDisplayProps) => {
    const circuit = designer.circuit;

    const [props] = useSelectionProps(
        circuit,
        (o): o is Obj => true,
        (o) => ({ kind: o.kind }),
    );

    if (!props)
        return null;

    // Make sure all components have same kind, otherwise don't display
    const allSame = props.kind.every((kind) => (kind === props.kind[0]));
    if (!allSame)
        return null;

    // Check if the kind is an IC, if so, use the user-set IC name
    const ic = circuit.getIC(props.kind[0]);
    const kind = (ic?.name ?? props.kind[0]);

    return (
        <div className="info-button">
            <div>{kind}</div>
            <a href={docsUrlConfig[kind]}
               target="_blank"
               rel="noopener noreferrer"
               title="Click for component information">
                ?
            </a>
        </div>
    );
}
