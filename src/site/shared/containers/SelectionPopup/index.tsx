import {useLayoutEffect, useState} from "react";

import {HEADER_HEIGHT} from "site/utils/Constants";

import {V} from "Vector";
import {Camera} from "math/Camera";

import {Event} from "core/utils/Events";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {Action} from "core/actions/Action";

import {TitleModule} from "./modules/TitleModule";
import {UseModuleProps} from "./modules/Module";

import "./index.scss";
import {CreateICButtonModule} from "./modules/CreateICButtonModule";


type Props = {
    camera: Camera;
    selections: SelectionsWrapper;
    modules: ((props: UseModuleProps) => JSX.Element)[];
    addAction: (action: Action) => void;
    render: () => void;
    eventHandler: {
        addListener: (listener: (ev: Event, change: boolean) => void) => void;
    };
}
export function SelectionPopup({modules, camera, selections, addAction, render, eventHandler}: Props) {
    const [state, setState] = useState({
        visible: false,
        pos: V()
    });

    useLayoutEffect(() => {
        eventHandler.addListener((ev, change) => {
            const getPos = () => camera.getScreenPos(selections.midpoint(true));

            // Don't show popup if dragging
            if (ev.type === "mousedrag" && change) {
                setState({
                    pos: getPos(),
                    visible: false
                });
            } else if (ev.type === "mouseup" || change) {
                setState({
                    pos: getPos(),
                    visible: (selections.amount() > 0)
                });
            }
        });

        return () => {console.log("I SHOULD NOT BE HERE")}
    }, [eventHandler, camera, selections]);

    return (
        <div className="selection-popup"
             style={{
                left: `${state.pos.x}px`,
                top:  `${state.pos.y + HEADER_HEIGHT}px`,
                visibility: (state.visible ? "visible": "hidden")
             }}
             tabIndex={-1}>
            <TitleModule selections={selections} addAction={addAction} render={render} />
            <hr />
            {modules.map((m,i) => m({
                selections,
                addAction,
                render,
                key: `selection-popup-module-${i}`
            } as any))}
        </div>
    );
}
