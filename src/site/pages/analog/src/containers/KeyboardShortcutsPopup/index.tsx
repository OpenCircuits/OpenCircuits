import React, {useState} from "react";

import {GetOS} from "shared/utils/GetOS";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseHeaderPopups} from "shared/state/Header";

import {Popup} from "shared/components/Popup";

import "./index.scss";


type ShortcutProps = {
    os: ReturnType<typeof GetOS>;
    label: string;
    pre?: string;
    keys: string[];
    mod?: boolean;
}
const Shortcut = ({ os, label, pre, keys, mod }: ShortcutProps) => (
    <tr>
        <td>{label}</td>
        <td>
            {pre}
            {mod && <span id="key">{os === "mac" ? "CMD" : "CTRL"}</span>}
            {keys.map((key, i) => (
                <React.Fragment key={`keyboardshortcuts__popup__${label}-${key}-${i}`}>
                    {(i > 0 || mod) && <span>+ </span>}
                    <span id="key">{key}</span>
                </React.Fragment>
            ))}
        </td>
    </tr>
);

export const KeyboardShortcutsPopup = () => {
    const { curPopup } = useSharedSelector(
        (state) => ({ curPopup: state.header.curPopup })
    );
    const dispatch = useSharedDispatch();

    const [{ os }, setState] = useState({ os: GetOS() });

    return (
        <Popup title="Keyboard Shortcuts"
               className="keyboardshortcuts__popup"
               isOpen={(curPopup === "keyboard_shortcuts")}
               close={() => dispatch(CloseHeaderPopups())}>
            <div className="keyboardshortcuts__popup__toggle__container">
                <button type="button" name="win"
                        className={os !== "mac" ? "selected" : ""}
                        onClick={() => setState({ os: "win" })}>Windows / ChromeOS Shortcuts</button>

                <button type="button" name="mac"
                        className={os === "mac" ? "selected" : ""}
                        onClick={() => setState({ os: "mac" })}>Mac Shortcuts</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Function</th>
                        <th>Shortcut</th>
                    </tr>
                </thead>
                <tbody>
                    <Shortcut os={os} label="Undo"          keys={["Z"]}          mod />
                    <Shortcut os={os} label="Redo"          keys={["Shift", "Z"]} mod />
                    <Shortcut os={os} label="Cut"           keys={["X"]}          mod />
                    <Shortcut os={os} label="Copy"          keys={["C"]}          mod />
                    <Shortcut os={os} label="Paste"         keys={["V"]}          mod />
                    <Shortcut os={os} label="Select All"    keys={["A"]}          mod />
                    <Shortcut os={os} label="Deselect All"  keys={["Esc"]}            />
                    <Shortcut os={os} label="Delete"        keys={["Backspace"]}      />
                    <Shortcut os={os} label="Snip"          keys={["X"]}              />
                    <Shortcut os={os} label="Snapping"      keys={["Shift"]} pre="Hold " />
                    <Shortcut os={os} label="Duplicate"     keys={["D"]}          mod />
                    <Shortcut os={os} label="Fit to Screen" keys={["F"]}              />
                </tbody>
            </table>
        </Popup>
    );
};
