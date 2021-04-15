import {CircuitInfo} from "core/utils/CircuitInfo";
import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {SharedAppState} from "shared/state";
import {ToggleItemNav} from "shared/state/ItemNav/actions";

import "./index.scss";


export type ItemNavItem = {
    id: string;
    label: string;
    icon: string;
}
export type ItemNavSection = {
    id: string;
    label: string;
    items: ItemNavItem[];
}
export type ItemNavConfig = {
    imgRoot: string;
    sections: ItemNavSection[];
}


type OwnProps = {
    info: CircuitInfo;
    config: ItemNavConfig;
}
type StateProps = {
    isOpen: boolean;
    isEnabled: boolean;
    isLocked: boolean;
}
type DispatchProps = {
    toggle: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
function _ItemNav({ info, config, isOpen, isEnabled, isLocked, toggle }: Props) {
    const [{canUndo, canRedo}, setState] = useState({ canUndo: false, canRedo: false });

    useEffect(() => {
        const onHistoryChange = () => {
            setState({
                canUndo: info.history.getActions().length > 0,
                canRedo: info.history.getRedoActions().length > 0
            });
        }

        info.history.addCallback(onHistoryChange);

        return () => info.history.removeCallback(onHistoryChange);
    }, [info, setState]);

    return (<>
        { // Hide tab if the circuit is locked
        (isEnabled && !isLocked) &&
            <>
                <div className={`tab ${isOpen ? "tab__closed" : ""}`}
                     title="Circuit Components"
                     onClick={() => toggle()}></div>
            </>
        }
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            <div className="itemnav__top">
                <div className="itemnav__top__history__buttons">
                    <button title="Undo" disabled={!canUndo} onClick={() => info.history.undo() }><img src="img/icons/undo.svg" alt="" /></button>
                    <button title="Redo" disabled={!canRedo} onClick={() => info.history.redo() }><img src="img/icons/redo.svg" alt="" /></button>
                </div>
            </div>
            {config.sections.map((section, i) =>
                <React.Fragment key={`itemnav-section-${i}`}>
                    <h4>{section.label}</h4>
                    {section.items.map((item, j) =>
                        <button key={`itemnav-section-${i}-item-${j}`}
                                onDragStart={(ev) => {
                                    ev.dataTransfer.setData("custom/component", item.id);
                                    ev.dataTransfer.dropEffect = "copy";
                                }}>
                            <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                            <br />
                            {item.label}
                        </button>
                    )}
                </React.Fragment>
            )}
        </nav>
    </>);
}


const MapState = (state: SharedAppState) => ({
    isLocked: state.circuit.isLocked,
    isEnabled: state.itemNav.isEnabled,
    isOpen: state.itemNav.isOpen
});
const MapDispatch = {
    toggle: ToggleItemNav
};

export const ItemNav = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    MapState,
    MapDispatch
)(_ItemNav);
