import {useRef, useState} from "react";

import {V} from "Vector";

import {useDocEvent}                          from "shared/site/utils/hooks/useDocEvent";
import {useHistory}                           from "shared/site/utils/hooks/useHistory";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CleanUp}             from "shared/api/circuitdesigner/tools/handlers/CleanupHandler";
import {DuplicateSelections} from "shared/api/circuitdesigner/tools/handlers/DuplicateHandler";
import {FitToScreen}         from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {CloseContextMenu, OpenContextMenu} from "shared/site/state/ContextMenu";

import "./index.scss";


function isClipboardSupported(type: "read" | "write"): boolean {
    return (navigator.clipboard !== undefined &&
            (type === "read" ? navigator.clipboard.readText  !== undefined :
                               navigator.clipboard.writeText !== undefined));
}

type Props = {
    designer: CircuitDesigner;
}
export const ContextMenu = ({ designer }: Props) => {
    const circuit = designer.circuit;
    const { undoHistory, redoHistory } = useHistory(circuit);

    const { isOpen } = useSharedSelector(
        (state) => ({ isOpen: state.contextMenu.isOpen })
    );
    const dispatch = useSharedDispatch();

    const [{ posX, posY }, setPos] = useState({ posX: 0, posY: 0 });

    const menu = useRef<HTMLDivElement>(null);

    // Setup events to open/close the context menu
    useDocEvent("contextmenu", (ev) => {
        // TODO()[leon] - this is kinda a hack, it would be better
        //  to have a ref to the canvas this applies to or something
        if (ev.target instanceof HTMLCanvasElement) {  // Only open when clicking on a canvas
            dispatch(OpenContextMenu());
            setPos({ posX: ev.clientX, posY: ev.clientY });
        }
    }, [dispatch, setPos]);
    useDocEvent("mousedown", (ev) => {
        if (!menu.current)
            throw new Error("ContextMenu failed: menu.current is null");

        if (!menu.current.contains(ev.target as Node))
            dispatch(CloseContextMenu());
    }, [dispatch, menu]);


    /* Context Menu "Cut" */
    const onCut = async () => {
        if (!isClipboardSupported("write")) {
            alert("Your web browser does not support right click CUT operation. Please use CTRL+X");
            return;
        }
        // TODO: replace serialize
        // await navigator.clipboard.writeText(circuit.serialize(circuit.selections.all));

        circuit.beginTransaction();
        circuit.deleteObjs([...circuit.selections.components, ...circuit.selections.wires]);
        circuit.commitTransaction("Cut (Context Menu)");
    }

    /* Context Menu "Copy" */
    const onCopy = async () => {
        if (!isClipboardSupported("write")) {
            alert("Your web browser does not support right click COPY operation. Please use CTRL+C");
            return;
        }
        // TODO: replace serialize
        // await navigator.clipboard.writeText(circuit.serialize(circuit.selections.all));
    }

    /* Context Menu "Paste" */
    const onPaste = async () => {
        if (!isClipboardSupported("read")) {
            alert("Your web browser does not support right click PASTE operation. Please use CTRL+V");
            return;
        }
        // TODO[model_refactor](leon) - figure out pasting API
        // paste(await navigator.clipboard.readText(), camera.getWorldPos(V(posX, posY)));
    }

    /* Context Menu "Select All" */
    const onSelectAll = async () => {
        circuit.beginTransaction();
        circuit.getComponents().forEach((c) => c.select());
        circuit.commitTransaction("Selected All (Context Menu)");
    }

    /* Context Menu "Focus" */
    const onFocus = async () => {
        FitToScreen(circuit, designer.viewport);
    }

    /* Context Menu "Clean Up" */
    const onCleanUp = async () => {
        CleanUp(circuit);
    }

    /* Context Menu "Duplicate" */
    const onDuplicate = async () => {
        DuplicateSelections(circuit);
    }

    /* Context Menu "Undo/Redo" */
    const onUndo = async () => { circuit.undo(); };
    const onRedo = async () => { circuit.redo(); };


    /* Helper function for buttons to call the function and render/close the popup */
    const doFunc = (func: () => void) => {
        // Don't do anything if locked
        // TODO: Move locked functionality to frontend only
        // if (circuit.locked)
        //     return;
        func();
        dispatch(CloseContextMenu());
    }

    // Adjusts position of menu to keep it on screen
    const menuPos = (() => {
        if (!menu.current)
            return V(posX, posY);

        const { width, height } = menu.current.getBoundingClientRect();

        return V(
            (posX + width  > window.innerWidth)  ? (posX - width)  : posX,
            (posY + height > window.innerHeight) ? (posY - height) : posY,
        );
    })();

    return (
        <div ref={menu}
             className="contextmenu"
             style={{
                 left:       `${menuPos.x}px`,
                 top:        `${menuPos.y}px`,
                 visibility: (isOpen ? "initial" : "hidden"),
             }}>
            <button type="button"
                    title="Cut"
                    disabled={circuit.selections.isEmpty}
                    onClick={() => doFunc(onCut)}>Cut</button>
            <button type="button"
                    title="Copy"
                    disabled={circuit.selections.isEmpty}
                    onClick={() => doFunc(onCopy)}>Copy</button>
            <button type="button"
                    title="Paste"
                    onClick={() => doFunc(onPaste)}>Paste</button>
            <button type="button"
                    title="Select All"
                    disabled={circuit.getObjs().length === 0}
                    onClick={() => doFunc(onSelectAll)}>Select All</button>
            <hr />
            <button type="button"
                    title="Focus"
                    onClick={() => doFunc(onFocus)}>Focus</button>
            <button type="button"
                    title="CleanUp"
                    disabled={circuit.getObjs().length === 0}
                    onClick={() => doFunc(onCleanUp)}>Clean Up</button>
            <button type="button"
                    title="Duplicate"
                    disabled={circuit.selections.isEmpty}
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
