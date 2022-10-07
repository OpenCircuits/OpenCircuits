import {useEffect, useRef, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {CircuitInfo}      from "core/utils/CircuitInfo";
import {SerializeForCopy} from "core/utils/ComponentUtils";

import {V, Vector} from "core/utils/math/Vector";

import {GroupAction} from "core/actions/GroupAction";

import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {DeselectAll, SelectGroup} from "core/actions/units/Select";

import {CleanUpHandler}     from "core/tools/handlers/CleanUpHandler"
import {DuplicateHandler}   from "core/tools/handlers/DuplicateHandler"
import {FitToScreenHandler} from "core/tools/handlers/FitToScreenHandler"

import {IOObject} from "core/models";

import {useDocEvent}                          from "shared/utils/hooks/useDocEvent";
import {useHistory}                           from "shared/utils/hooks/useHistory";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseContextMenu, OpenContextMenu} from "shared/state/ContextMenu";

import "./index.scss";


function isClipboardSupported(type: "read" | "write"): boolean {
    return (navigator.clipboard !== undefined &&
            (type === "read" ? navigator.clipboard.readText  !== undefined :
                               navigator.clipboard.writeText !== undefined));
}

// vertical offset so that context menu appears at cursor location
const CONTEXT_MENU_VERT_OFFSET = 4;

type Props = {
    info: CircuitInfo;
    paste: (text: string, menuPos: Vector) => boolean;
}


export const ContextMenu = ({ info, paste }: Props) => {
    const { locked, input, camera, history, designer, selections, renderer } = info;
    const { undoHistory, redoHistory } = useHistory(info);

    const { isOpen } = useSharedSelector(
        (state) => ({ isOpen: state.contextMenu.isOpen })
    );
    const dispatch = useSharedDispatch();

    const [{ posX, posY }, setPos] = useState({ posX: 0, posY: 0 });

    useEffect(() => {
        if (!input)
            return;

        input.addListener((ev) => {
            if (ev.type === "contextmenu")
                dispatch(OpenContextMenu());
            else if (ev.type === "mousedown")
                dispatch(CloseContextMenu());
        });
    }, [input, dispatch]);

    // Position changes are calculated using the react hook so that the
    // context menu does not jump around during other update events.
    // fixes issue #914
    useEffect(() => {
        if (!isOpen)
            return;
        // Updates position state
        const pos = input?.getMousePos();
        setPos({ posX: pos.x, posY: pos.y });
    }, [input, isOpen, setPos]);

    useDocEvent("mousedown", (ev) => {
        if (!menu.current)
            throw new Error("ContextMenu failed: menu.current is null");

        if (!menu.current.contains(ev.target as Node))
            dispatch(CloseContextMenu());
    }, [dispatch]);


    const copy = () => {
        const objs = selections.get().filter((o) => o instanceof IOObject) as IOObject[];
        return SerializeForCopy(objs);
    }


    /* Context Menu "Cut" */
    const onCut = async () => {
        if (!isClipboardSupported("write")) {
            alert("Your web browser does not support right click CUT operation. Please use CTRL+X");
            return;
        }
        await navigator.clipboard.writeText(copy());

        // Delete selections
        const objs = selections.get().filter((s) => s instanceof IOObject) as IOObject[];
        history.add(new GroupAction([
            DeselectAll(selections),
            DeleteGroup(designer, objs),
        ], "Cut (Context Menu)"));
    }

    /* Context Menu "Copy" */
    const onCopy = async () => {
        if (!isClipboardSupported("write")) {
            alert("Your web browser does not support right click COPY operation. Please use CTRL+C");
            return;
        }
        await navigator.clipboard.writeText(copy());
    }

    /* Context Menu "Paste" */
    const onPaste = async () => {
        if (!isClipboardSupported("read")) {
            alert("Your web browser does not support right click PASTE operation. Please use CTRL+V");
            return;
        }
        paste(await navigator.clipboard.readText(), camera.getWorldPos(V(posX, posY)));
    }

    /* Context Menu "Select All" */
    const onSelectAll = async () => {
        history.add(SelectGroup(selections, designer.getObjects()));
    }

    /* Context Menu "Focus" */
    const onFocus = async () => {
        FitToScreenHandler.getResponse(info);
    }

    /* Context Menu "Clean Up" */
    const onCleanUp = async () => {
        CleanUpHandler.getResponse(info);
    }

    /* Context Menu "Duplicate" */
    const onDuplicate = async () => {
        DuplicateHandler.getResponse(info);
    }

    /* Context Menu "Undo/Redo" */
    const onUndo = async () => history.undo();
    const onRedo = async () => history.redo();


    /* Helper function for buttons to call the function and render/close the popup */
    const doFunc = (func: () => void) => {
        // Don't do anything if locked
        if (locked)
            return;
        func();
        renderer.render();
        dispatch(CloseContextMenu());
    }


    const menu = useRef<HTMLDivElement>(null);

    // Adjusts position of menu to keep it on screen
    const menuPos = V(posX, posY);
    if (menu.current) {
        const offset = 1;
        const { width, height } = menu.current.getBoundingClientRect();

        if (menuPos.x + width > window.innerWidth)
            menuPos.x -= width - offset;

        if (menuPos.y + height + HEADER_HEIGHT - CONTEXT_MENU_VERT_OFFSET > window.innerHeight)
            menuPos.y -= height - offset;
    }

    return (
        <div ref={menu}
             className="contextmenu"
             style={{
                 left:       `${menuPos.x}px`,
                 top:        `${menuPos.y + HEADER_HEIGHT - CONTEXT_MENU_VERT_OFFSET}px`,
                 visibility: (isOpen ? "initial" : "hidden"),
             }}>
            <button type="button"
                    title="Cut"
                    disabled={selections.amount() === 0}
                    onClick={() => doFunc(onCut)}>Cut</button>
            <button type="button"
                    title="Copy"
                    disabled={selections.amount() === 0}
                    onClick={() => doFunc(onCopy)}>Copy</button>
            <button type="button"
                    title="Paste"
                    onClick={() => doFunc(onPaste)}>Paste</button>
            <button type="button"
                    title="Select All"
                    disabled={designer.getObjects().length === 0}
                    onClick={() => doFunc(onSelectAll)}>Select All</button>
            <hr />
            <button type="button"
                    title="Focus"
                    onClick={() => doFunc(onFocus)}>Focus</button>
            <button type="button"
                    title="CleanUp"
                    disabled={designer.getObjects().length === 0}
                    onClick={() => doFunc(onCleanUp)}>Clean Up</button>
            <button type="button"
                    title="Duplicate"
                    disabled={selections.amount() === 0}
                    onClick={() => doFunc(onDuplicate)}>Duplicate</button>
            <hr />
            <button type="button"
                    title="Undo"
                    disabled={undoHistory.length === 0}
                    onClick={() => doFunc(onUndo)}>Undo</button>
            <button type="button"
                    title="Redo"
                    disabled={redoHistory.length === 0}
                    onClick={() => doFunc(onRedo)}>Redo</button>
        </div>
    );
}
