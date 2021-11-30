import {GetIDFor} from "serialeazy";
import {useLayoutEffect, useState} from "react";

import {DOUBLE_CLICK_DURATION} from "shared/utils/Constants";

import {V} from "Vector";
import {Camera} from "math/Camera";

import {Event} from "core/utils/Events";
import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {Action} from "core/actions/Action";

import {TitleModule} from "./modules/TitleModule";
import {UseModuleProps} from "./modules/Module";

import "./index.scss";
import {CircuitInfo} from "core/utils/CircuitInfo";

type Props = {
    info: CircuitInfo;
    modules: ((props: UseModuleProps) => JSX.Element)[];
    docsUrlConfig: Record<string,string>;
}
export function SelectionPopup({info, modules, docsUrlConfig}: Props) {
    const {input, camera, history, designer, selections, renderer} = info;
    const [state, setState] = useState({
        visible: false,
        pos: V(),
        clickThrough: false
    });

    useLayoutEffect(() => {
        let lastPos = V();
        let lastVisible = false;
        let dragging = false;
        let clickThrough = false;

        const getPos = () => {
            const pos = camera.getScreenPos(selections.midpoint(true));
            if (pos.x === lastPos.x && pos.y === lastPos.y)
                return lastPos;
            return pos;
        };

        const update = (ev: Event, force = false) => {
            if (ev.type === "mousedrag")
                dragging = true;
            if (ev.type === "mouseup")
                dragging = false;

            // Let user click through box so it doesn't block a double click
            if (ev.type === "click")
                clickThrough = true;

            const pos = getPos();

            // Don't show popup if dragging
            const visible = (dragging ? false : (selections.amount() > 0));

            // Nothing changed so don't update the state
            if (pos === lastPos && visible === lastVisible && !force)
                return;

            setState({ pos, visible, clickThrough });

            // Set up a callback that will make the box clickable if it's currently not clickable
            if (clickThrough) {
                clickThrough = false;
                setTimeout(() =>
                    setState((prevState) => ({ ...prevState, clickThrough })),
                    DOUBLE_CLICK_DURATION
                );
            }

            lastPos = pos;
            lastVisible = visible;
        }

        if (!input)
            return;
        input.addListener(update);

        // Fixes issue #753. This is necessary because when a bus is made, no change is recorded in the system, so it does not
        // update to remove the bus button as intended. The function below ensures that when a bus is made, an upate is called.
        designer.addCallback(() => update({type:"unknown"}, true));

        return () => {console.log("I SHOULD NOT BE HERE")}
    }, [input, camera, selections, setState]);
    let infoLink = "";
    let showInfoButton = false;
    let id = "";

    if (selections.amount() > 0 ){
        id = GetIDFor(selections.get()[0]);
        if (selections.get().every(c => GetIDFor(c) === id || selections.amount() === 1)){
            infoLink = (id in docsUrlConfig ? docsUrlConfig[id as keyof typeof docsUrlConfig] : undefined);
            showInfoButton = true;
        }
    }

    return (
        <div className="selection-popup"
             style={{
                left: `${state.pos.x}px`,
                top:  `${state.pos.y}px`,
                visibility: (state.visible ? "visible": "hidden"),
                pointerEvents: (state.clickThrough ? "none" : "auto")
             }}
             tabIndex={-1}>

            {showInfoButton && <div className="info-button">
                <div>{id}</div>
                <a href={infoLink} target="_blank" rel="noopener noreferrer" title="Click for component information">?</a> 
            </div>}
            <TitleModule selections={selections}
                         addAction={(a) => history.add(a)}
                         render={() => renderer.render()}
                         forceUpdate={() => setState((s) => ({...s}))} />
            <hr />
            {modules.map((m,i) => m({
                selections,
                addAction: (a: Action) => history.add(a),
                render: () => renderer.render(),
                forceUpdate: () => setState((s) => ({...s})),
                key: `selection-popup-module-${i}`
            } as any))}
        </div>
    );
}
