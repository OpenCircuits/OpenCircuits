
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";
import {IOObject} from "core/models";
import {CircuitInfo} from "core/utils/CircuitInfo";
import {SerializeForCopy} from "core/utils/ComponentUtils";
import {Selectable} from "core/utils/Selectable";
import {connect} from "react-redux";
import {SharedAppState} from "shared/state";
import {CloseContextMenu} from "shared/state/ContextMenu/actions";

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
    close: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _ContextMenu = ({isOpen, info, paste, close}: Props) => {
    const {input, history, designer, selections, renderer} = info;


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

    const pos = input?.getMousePos();

    return (
        <div className="contextmenu"
             style={{
                 left: `${pos?.x}px`,
                 top: `${pos?.y + 65}px`,
                 display: (isOpen ? "initial" : "none")
             }}>
            <button title="Cut"        onClick={() => { onCut();       renderer.render(); close(); }}>Cut</button>
            <button title="Copy"       onClick={() => { onCopy();      renderer.render(); close(); }}>Copy</button>
            <button title="Paste"      onClick={() => { onPaste();     renderer.render(); close(); }}>Paste</button>
            <button title="Select All" onClick={() => { onSelectAll(); renderer.render(); close(); }}>Select All</button>
            <hr/>
            <button title="Undo" onClick={() => { onUndo(); renderer.render(); close(); }}>Undo</button>
            <button title="Redo" onClick={() => { onRedo(); renderer.render(); close(); }}>Redo</button>
        </div>
    );
}

export const ContextMenu = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isOpen: state.contextMenu.isOpen }),
    { close: CloseContextMenu }
)(_ContextMenu);
