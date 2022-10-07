import React, {useCallback, useEffect, useRef, useState} from "react";
import {GetIDFor}                                        from "serialeazy";

import {DOUBLE_CLICK_DURATION, HEADER_HEIGHT} from "shared/utils/Constants";

import {Clamp} from "math/MathUtils";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {useEvent}          from "shared/utils/hooks/useEvent";
import {useSharedSelector} from "shared/utils/hooks/useShared";

import {TitleModule} from "./modules/TitleModule";

import "./index.scss";


type Props = {
    info: CircuitInfo;
    docsUrlConfig: Record<string, string>;
    children: React.ReactNode;
}
export const SelectionPopup = ({ info, docsUrlConfig, children }: Props) => {
    const { input, camera, history, selections } = info;

    const itemNavCurItem = useSharedSelector((state) => state.itemNav.curItemID);

    const [isVisible, setIsVisible] = useState(false);
    const [id, setID] = useState("");
    useEffect(() => {
        const update = () => {
            setIsVisible(selections.amount() > 0);

            // Make sure all components have same ID
            const ids = selections.get().map(GetIDFor);
            setID((ids.length > 0 && ids.every((id) => id === ids[0])) ? ids[0]! : "");
        }

        selections.addChangeListener(update);
        return () => selections.removeChangeListener(update);
    }, [selections, setIsVisible]);


    const [pos, setPos] = useState({ x: 0, y: 0 });
    const updatePos = useCallback(() => {
        setPos(camera.getScreenPos(selections.midpoint(true)));
    }, [camera, selections, setPos]);

    useEffect(() => {
        // Subscribe to history for translation/selection changes
        history.addCallback(updatePos);
        return () => history.removeCallback(updatePos);
    }, [history, updatePos]);
    useEvent("zoom", updatePos, input, [updatePos]);

    const [isDragging, setIsDragging] = useState(false);
    useEvent("mousedrag", (_) => {
        setIsDragging(true); // Don't show popup if dragging
    }, input, [setIsDragging]);
    useEvent("mouseup", (_) => {
        setIsDragging(false); // Show when stopped dragging
        updatePos(); // And recalculate position
    }, input, [updatePos, setIsDragging]);


    const [clickThrough, setClickThrough] = useState(false);
    useEvent("click", (_) => {
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
    }, input, [setClickThrough]);

    const popup = useRef<HTMLDivElement>(null);

    // Clamp position to screen if visible
    if (isVisible && !isDragging) {
        if (!popup.current)
            throw new Error("SelectionPopup failed: popup.current is null");
        const { width, height } = popup.current.getBoundingClientRect();

        pos.x = Clamp(pos.x, 0, window.innerWidth - width);

        // Since the Selection Popup has a transform (0, -50%), this `y` position is the
        //  y position of the middle of it, not the top
        pos.y = Clamp(pos.y, height/2, window.innerHeight - HEADER_HEIGHT - height/2);
    }

    const infoLink = (id in docsUrlConfig ? docsUrlConfig[id as keyof typeof docsUrlConfig] : undefined);

    return (
        <div ref={popup}
             className="selection-popup"
             tabIndex={-1}
             style={{
                left:          `${pos.x}px`,
                top:           `${pos.y}px`,
                visibility:    (isVisible && !isDragging ? "visible": "hidden"),
                // Fixes issue with double clicks and when dragging from the ItemNav
                //  Issues #521 and #863 respectively
                pointerEvents: (clickThrough || !!itemNavCurItem ? "none" : "auto"),
             }}>
            {id && (<div className="info-button">
                <div>{id}</div>
                <a href={infoLink} target="_blank" rel="noopener noreferrer"
                   title="Click for component information">?</a>
            </div>)}
            <TitleModule info={info}  />
            <hr />
            {children}
        </div>
    );
}
