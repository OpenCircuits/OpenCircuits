import {useEffect, useRef} from "react";
import {HEADER_HEIGHT} from "shared/utils/Constants";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {SerializeForCopy} from "core/utils/ComponentUtils";
import {V, Vector} from "core/utils/math/Vector";

import {IOObject} from "core/models";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CloseContextMenu, OpenContextMenu} from "shared/state/ContextMenu";
import {useHistory} from "shared/utils/hooks/useHistory";


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


export const ContextMenu = ({info, paste}: Props) => {
    const {locked, input, camera, history, designer, selections, renderer} = info;
    const {undoHistory, redoHistory} = useHistory(info);

    const {isOpen} = useSharedSelector(
        state => ({ isOpen: state.contextMenu.isOpen })
    );
    const dispatch = useSharedDispatch();

    let menuPos: Vector;

    useEffect(() => {
        if (!input)
            return;

        input.addListener((ev) => {
            if (ev.type === "contextmenu")
                dispatch(OpenContextMenu());
            else if (ev.type === "mousedown")
                dispatch(CloseContextMenu());
        });
    }, [input])


    const copy = () => {
        const objs = selections.get().filter(o => o instanceof IOObject) as IOObject[];
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
        const objs = selections.get().filter(s => s instanceof IOObject) as IOObject[];
        history.add(new GroupAction([
            CreateDeselectAllAction(selections),
            CreateDeleteGroupAction(designer, objs)
        ]).execute());
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
        paste(await navigator.clipboard.readText(), menuPos);
    }

    /* Context Menu "Select All" */
    const onSelectAll = async () => {
        history.add(CreateGroupSelectAction(selections, designer.getObjects()).execute());
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
    let pos = input?.getMousePos();

    /* Relocate context menu to opposite side of cursor if it were to go off-screen */
    if (isOpen) {
        if (!menu.current)
            throw new Error("ContextMenu failed: menu.current is null");
        const offset = 1;
        const contextMenuWidth = menu.current.getBoundingClientRect().width;
        const contextMenuHeight = menu.current.getBoundingClientRect().height;

        if (pos.x + contextMenuWidth > window.innerWidth)
            pos.x -= contextMenuWidth - offset;

        if (pos.y + contextMenuHeight + HEADER_HEIGHT - CONTEXT_MENU_VERT_OFFSET > window.innerHeight)
            pos.y -= contextMenuHeight - offset;

        // Update context menu position on canvas
        menuPos = camera.getWorldPos(input.getMousePos());
    }

    return (
        <div className="contextmenu"
             ref={menu}
             style={{
                 left: `${pos?.x}px`,
                 top: `${pos?.y + HEADER_HEIGHT - CONTEXT_MENU_VERT_OFFSET}px`,
                 visibility: (isOpen ? "initial" : "hidden")
             }}>
            <button title="Cut"        onClick={() => doFunc(onCut)} disabled={selections.amount() === 0}>Cut</button>
            <button title="Copy"       onClick={() => doFunc(onCopy)} disabled={selections.amount() === 0}>Copy</button>
            <button title="Paste"      onClick={() => doFunc(onPaste)}>Paste</button>
            <button title="Select All" onClick={() => doFunc(onSelectAll)} disabled={designer.getObjects().length === 0}>Select All</button>
            <hr/>
            <button title="Undo" onClick={() => doFunc(onUndo)} disabled={undoHistory.length === 0}>Undo</button>
            <button title="Redo" onClick={() => doFunc(onRedo)} disabled={redoHistory.length === 0}>Redo</button>
        </div>
    );
}
