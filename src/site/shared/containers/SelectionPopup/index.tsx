import {useLayoutEffect, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

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
}
export function SelectionPopup({info, modules}: Props) {
    const {input, camera, history, designer, selections, renderer} = info;
    const [state, setState] = useState({
        visible: false,
        pos: V()
    });

    useLayoutEffect(() => {
        let lastPos = V();
        let lastVisible = false;
        let dragging = false;

        const getPos = () => {
            const pos = camera.getScreenPos(selections.midpoint(true));
            if (pos.x === lastPos.x && pos.y === lastPos.y)
                return lastPos;
            return pos;
        };

        const update = (ev: Event) => {
            if (ev.type === "mousedrag")
                dragging = true;
            if (ev.type === "mouseup")
                dragging = false;

            const pos = getPos();

            // Don't show popup if dragging
            const visible = (dragging ? false : (selections.amount() > 0));

            // Nothing changed so don't update the state
            if (pos === lastPos && visible === lastVisible)
                return;

            setState({ pos, visible });

            lastPos = pos;
            lastVisible = visible;
        }

        if (!input)
            return;
        input.addListener(update);
        // designer.addCallback(update);

        return () => {console.log("I SHOULD NOT BE HERE")}
    }, [input, camera, selections, setState]);

    return (
        <div className="selection-popup"
             style={{
                left: `${state.pos.x}px`,
                top:  `${state.pos.y + HEADER_HEIGHT}px`,
                visibility: (state.visible ? "visible": "hidden")
             }}
             tabIndex={-1}>
            <TitleModule designer={designer}
                         selections={selections}
                         addAction={(a) => history.add(a)}
                         render={() => renderer.render()} />
            <hr />
            {modules.map((m,i) => m({
                designer, selections,
                addAction: (a: Action) => history.add(a),
                render: () => renderer.render(),
                key: `selection-popup-module-${i}`
            } as any))}
        </div>
    );
}
