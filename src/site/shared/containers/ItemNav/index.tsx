import React from "react";
import {connect} from "react-redux";

import {AppState} from "site/state";
import {ToggleItemNav} from "site/state/ItemNav/actions";
import {ICItemNavData} from "site/state/ItemNav/state";

import "./index.scss";


export type ItemNavConfig = {
    imgRoot: string;
    sections: {
        id: string;
        label: string;
        items: {
            id: string;
            label: string;
            icon: string;
        }[];
    }[];
}


type OwnProps = {
    config: ItemNavConfig;
}
type StateProps = {
    isOpen: boolean;
    isEnabled: boolean;
    isLocked: boolean;
    ics: ICItemNavData[];
}
type DispatchProps = {
    toggle: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
function _ItemNav({ isOpen, isEnabled, isLocked, ics, config, toggle }: Props) {
    return (
    <>
        { // Hide tab if the circuit is locked
        (isEnabled && !isLocked) &&
            <div className={`tab ${isOpen ? "tab__closed" : ""}`}
                 title="Circuit Components"
                 onClick={() => toggle()}></div>
        }
        <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
            {config.sections.map((section) =>
                <React.Fragment key={`itemnav-section-${section.id}`}>
                    <h4>{section.label}</h4>
                    {section.items.map((item) =>
                        <button key={`itemnav-section-${section.id}-item-${item.id}`}
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
            {ics.length > 0 ? <h4>ICs</h4> : null}
            {ics.map(ic =>
                <button key={`itemnav-section-ics-item-${ic.index}`}
                        onDragStart={(ev) => {
                            ev.dataTransfer.setData("custom/component", `ic/${ic.index}`);
                            ev.dataTransfer.dropEffect = "copy";
                        }}>
                    <img src={"/img/itemnav/other/multiplexer.svg"} alt={ic.name} />
                    <br />
                    {ic.name}
                </button>
            )}
        </nav>
    </>
    );
}


const MapState = (state: AppState) => ({
    isLocked: state.circuit.isLocked,
    isEnabled: state.itemNav.isEnabled,
    isOpen: state.itemNav.isOpen,
    ics: state.itemNav.ics
});
const MapDispatch = {
    toggle: ToggleItemNav
};

export const ItemNav = connect<StateProps, DispatchProps, OwnProps, AppState>(MapState, MapDispatch)(_ItemNav);
