import React, {useEffect, useRef, useState} from "react";

import {DOUBLE_CLICK_DURATION, HEADER_HEIGHT} from "shared/utils/Constants";

import {Clamp} from "math/MathUtils";

import {useDocEvent}       from "shared/utils/hooks/useDocEvent";
import {useSharedSelector} from "shared/utils/hooks/useShared";

import {CircuitDesigner} from "shared/circuitdesigner";

// import {TitleModule} from "./modules/TitleModule";

import "./index.scss";
import {V} from "Vector";


type Props = {
    designer: CircuitDesigner;
    docsUrlConfig: Record<string, string>;
    children: React.ReactNode;
}
export const SelectionPopup = ({ designer, docsUrlConfig, children }: Props) => {
    const circuit = designer.circuit;
    const itemNavCurItem = useSharedSelector((state) => state.itemNav.curItemID);

    const [numSelections, setNumSelections] = useState(0);
    const [pos, setPos] = useState(circuit.selections.midpoint("screen"));
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => circuit.selections.observe((ev) => {
        setNumSelections(ev.newAmt);
        setPos(circuit.selections.midpoint("screen"));
    }), [circuit, setNumSelections]);

    useEffect(() => circuit.camera.observe(() =>
        setPos(circuit.selections.midpoint("screen"))
    ), [circuit, setPos]);

    useEffect(() => circuit.camera.observe((ev) => {
        if (ev.type === "dragStart")
            setIsDragging(true); // Don't show popup if dragging
        if (ev.type === "dragEnd")
            setIsDragging(false); // Show when stopped dragging
    }), [circuit, setIsDragging]);

    const [clickThrough, setClickThrough] = useState(false);
    useDocEvent("click", (_) => {
        // Let user click through box so it doesn't block a double click
        setClickThrough((prevState) => {
            if (prevState) // If already have a timeout then just ignore
                return prevState;
            setTimeout(() =>
                setClickThrough(false),
                DOUBLE_CLICK_DURATION
            );
            return true;
        });
    }, [setClickThrough]);

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
            {/* <TitleModule designer={designer}  /> */}
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

    // const [id, setID] = useState("");
    // useEffect(() => circuit.subscribe((ev) => {
    //     if (ev.type !== "selected")
    //         return;
    //     const objs = circuit.selections.all;

    //     // Make sure all components have same kind
    //     const kinds = objs.map((o) => o.kind);
    //     setID((kinds.length > 0 && kinds.every((kind) => kind === kinds[0])) ? kinds[0]! : "");
    // }), [circuit]);

    const objs = circuit.selections.all;

    // Make sure all components have same kind
    const kinds = objs.map((o) => o.kind);
    const kind = ((kinds.length > 0 && kinds.every((kind) => kind === kinds[0])) ? kinds[0]! : "");

    const infoLink = (kind in docsUrlConfig ? docsUrlConfig[kind as keyof typeof docsUrlConfig] : undefined);

    return (
        <div className="info-button">
            <div>{kind}</div>
            <a href={infoLink} target="_blank" rel="noopener noreferrer" title="Click for component information">
                ?
            </a>
        </div>
    );
}
