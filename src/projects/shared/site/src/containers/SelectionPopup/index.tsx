import {Obj}                                from "shared/api/circuit/public";
import React, {useEffect, useRef, useState} from "react";

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
    const circuit = designer.circuit;
    const camera = designer.viewport.camera;
    const itemNavCurItem = useSharedSelector((state) => state.itemNav.curItemID);

    const [numSelections, setNumSelections] = useState(0);
    const [pos, setPos] = useState(camera.toScreenPos(circuit.selections.midpoint));
    const [isDragging, setIsDragging] = useState(false);
    const [clickThrough, setClickThrough] = useState(false);

    useEffect(() => circuit.selections.subscribe(() => {
        setNumSelections(circuit.selections.length);
        setPos(camera.toScreenPos(circuit.selections.midpoint));

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
    }), [circuit, setNumSelections, setClickThrough]);

    useEffect(() => camera.subscribe(() =>
        setPos(camera.toScreenPos(circuit.selections.midpoint))
    ), [circuit, setPos]);

    useEvent("mousedrag", (_) => {
        setIsDragging(true); // Don't show popup if dragging
    }, designer.viewport.canvasInfo?.input, [setIsDragging]);
    useEvent("mouseup", (_) => {
        setIsDragging(false); // Show when stopped dragging
        setPos(camera.toScreenPos(circuit.selections.midpoint)); // And recalculate position
    }, designer.viewport.canvasInfo?.input, [setPos, setIsDragging]);

    const popup = useRef<HTMLDivElement>(null);

    const isVisible = (numSelections > 0 && !isDragging);

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

    const kind = props.kind[0];

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
