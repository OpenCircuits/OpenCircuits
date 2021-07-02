import React from "react";
import {connect} from "react-redux";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {SharedAppState} from "shared/state";
import {ToggleItemNav} from "shared/state/ItemNav/actions";
import {Overlay} from "shared/components/Overlay";

import {CloseHistoryBox, OpenHistoryBox, ToggleSideNav} from "shared/state/SideNav/actions";

import {useHistory} from "shared/utils/hooks/useHistory";
import {Draggable} from "shared/components/DragDroppable/Draggable";

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
    isHistoryBoxOpen: boolean;
}
type DispatchProps = {
    ToggleItemNav: typeof ToggleItemNav;
    OpenHistoryBox: typeof OpenHistoryBox;
    CloseHistoryBox: typeof CloseHistoryBox;
}

type Props = StateProps & DispatchProps & OwnProps;
function _ItemNav({ info, config, isOpen, isEnabled, isLocked, isHistoryBoxOpen, ToggleItemNav, OpenHistoryBox, CloseHistoryBox }: Props) {
    const {undoHistory, redoHistory} = useHistory(info);

    return (
        <>
            <nav className={`itemnav ${(isOpen) ? "" : "itemnav__move"}`}>
                <div className="itemnav__top">
                    <div>
                        <button  title="History" onClick={() => {
                            if (isHistoryBoxOpen) CloseHistoryBox();
                            else OpenHistoryBox();
                        }}>
                            <img src="img/icons/history.svg"></img>
                        </button>
                    </div>
                    <div>
                        <div className="itemnav__top__history__buttons">
                            <button title="Undo"
                                    disabled={undoHistory.length === 0}
                                    onClick={() => info.history.undo() }>
                                <img src="img/icons/undo.svg" alt="" />
                            </button>
                            <button title="Redo"
                                    disabled={redoHistory.length === 0}
                                    onClick={() => info.history.redo() }>
                                <img src="img/icons/redo.svg" alt="" />
                            </button>
                        </div>
                    </div>
                    <div>
                        { // Hide tab if the circuit is locked
                        (isEnabled && !isLocked) &&
                            <div className={`itemnav__tab ${isOpen ? "" : "itemnav__tab__closed"}`}
                                title="Circuit Components"
                                onClick={() => ToggleItemNav()}>
                                <div></div>
                            </div>
                        }
                    </div>
                </div>
                <div className="itemnav__sections">
                    {config.sections.map((section, i) =>
                        <div key={`itemnav-section-${i}`}>
                            <h4>{section.label}</h4>
                            <div>
                                {section.items.map((item, j) =>
                                    <Draggable key={`itemnav-section-${i}-item-${j}`}
                                            data={item.id}>
                                        <button>
                                            <img src={`/${config.imgRoot}/${section.id}/${item.icon}`} alt={item.label} />
                                            <br />
                                            {item.label}
                                        </button>
                                    </Draggable>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            <div className="historybox" style={{display: (isHistoryBoxOpen ? "initial" : "none")}}>
                {info.history.getActions().reverse().map((a, i) => {
                    return <div key={`history-box-entry-${i}`} className="historybox__entry">{a.getName()}</div>
                })}
            </div>
        </>
    );
}


const MapState = (state: SharedAppState) => ({
    isLocked: state.circuit.isLocked,
    isEnabled: state.itemNav.isEnabled,
    isOpen: state.itemNav.isOpen,
    isHistoryBoxOpen: state.sideNav.isHistoryBoxOpen,
});
const MapDispatch = { ToggleItemNav, OpenHistoryBox, CloseHistoryBox };

export const ItemNav = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    MapState,
    MapDispatch
)(_ItemNav);
