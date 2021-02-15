import {useEffect} from "react";
import {connect} from "react-redux";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {SerializeForCopy} from "core/utils/ComponentUtils";

import {IOObject} from "core/models";

import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";

import {SharedAppState} from "shared/state";
import {CloseContextMenu, OpenContextMenu} from "shared/state/ContextMenu/actions";

import "./index.scss";


function isClipboardSupported(type: "read" | "write"): boolean {
    return (navigator.clipboard !== undefined &&
            (type === "read" ? navigator.clipboard.readText  !== undefined :
                               navigator.clipboard.writeText !== undefined));
}

type OwnProps = {
    info: CircuitInfo;
    paste: (text: string) => boolean;
}
type StateProps = {
    isOpen: boolean;
}
type DispatchProps = {
    OpenContextMenu: typeof OpenContextMenu;
    CloseContextMenu: typeof CloseContextMenu;
}

type Props = StateProps & DispatchProps & OwnProps;
const _ContextMenu = ({isOpen, info, paste, OpenContextMenu, CloseContextMenu}: Props) => {
    const {locked, input, history, designer, selections, renderer} = info;


    useEffect(() => {
        if (!input)
            return;

        input.addListener((ev) => {
            if (ev.type === "contextmenu")
                OpenContextMenu();
            else if (ev.type === "mousedown")
                CloseContextMenu();
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
        paste(await navigator.clipboard.readText());
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
        close();
    }


    const pos = input?.getMousePos();

    return (
        <div className="contextmenu"
             style={{
                 left: `${pos?.x}px`,
                 top: `${pos?.y + 65}px`,
                 display: (isOpen ? "initial" : "none")
             }}>
            <button title="Cut"        onClick={() => doFunc(onCut)}>Cut</button>
            <button title="Copy"       onClick={() => doFunc(onCopy)}>Copy</button>
            <button title="Paste"      onClick={() => doFunc(onPaste)}>Paste</button>
            <button title="Select All" onClick={() => doFunc(onSelectAll)}>Select All</button>
            <hr/>
            <button title="Undo" onClick={() => doFunc(onUndo)}>Undo</button>
            <button title="Redo" onClick={() => doFunc(onRedo)}>Redo</button>
        </div>
    );
}

export const ContextMenu = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isOpen: state.contextMenu.isOpen }),
    { OpenContextMenu, CloseContextMenu }
)(_ContextMenu);
