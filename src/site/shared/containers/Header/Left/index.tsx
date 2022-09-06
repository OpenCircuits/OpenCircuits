import {useCallback} from "react";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {SetCircuitName, ToggleCircuitLocked} from "shared/state/CircuitInfo";
import {CloseHistoryBox, OpenHistoryBox}     from "shared/state/ItemNav";
import {ToggleSideNav}                       from "shared/state/SideNav";

import {InputField} from "shared/components/InputField";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderLeft = ({ helpers }: Props) => {
    const { id, name, isSaved, isLocked, isLoggedIn, isHistoryBoxOpen, saving, error } = useSharedSelector(
        (state) => ({
            ...state.circuit,
            isLoggedIn:       state.user.isLoggedIn,
            isHistoryBoxOpen: state.itemNav.isHistoryBoxOpen,
        })
    );
    const dispatch = useSharedDispatch();

    const onEnter = useCallback(() => helpers.SaveCircuitRemote(), [helpers]);

    return (
        <div className="header__left">
            <button type="button" title="Side Bar"
                    className="header__left__sidebar"
                    onClick={() => dispatch(ToggleSideNav())}>
                &#9776;
            </button>

            <button type="button" title="History"
                    className="header__left__history"
                    onClick={() => dispatch((isHistoryBoxOpen) ? (CloseHistoryBox()) : (OpenHistoryBox()))}>
                <img src="img/icons/history-light.svg" alt="History box icon (light)"></img>
            </button>

            <button type="button" title="Lock/Unlock Editing"
                    className="header__left__lock"
                    onClick={() => dispatch(ToggleCircuitLocked())}>
                <img src="img/icons/lock_open.svg" className={isLocked ? "hide" : ""}
                     width="18px" height="18px" alt="Icon for unlocked lock" />
                <img src="img/icons/lock.svg"      className={isLocked ? "" : "hide"}
                     width="18px" height="18px" alt="Icon for lock" />
            </button>

            <InputField title="Circuit Name" type="text" value={name}
                        placeholder="Untitled Circuit*" alt="Name of project"
                        onChange={(s) => dispatch(SetCircuitName(s.target.value))}
                        onEnter={onEnter} />

            <button type="button" title="Save the circuit remotely" disabled={saving}
                    className={`header__left__save ${isSaved || !isLoggedIn ? "hide" : ""}`}
                    onClick={() => helpers.SaveCircuitRemote()}>
                Save
            </button>

            <button type="button" title="Duplicate the circuit"
                    className={`header__left__duplicate ${!isLoggedIn || id === "" ? "hide" : ""}`}
                    onClick={() => helpers.DuplicateCircuitRemote()}>
                <img src="img/icons/content_copy.svg" height="100%" alt="Copy circuit" />
            </button>

            <img src="img/icons/error.svg" className={error ? "" : "hide"}
                 title={`Error occured while saving: ${error}`} alt="Icon when save failed" />
            <span title="Saving..." className={`header__left__saving ${saving ? "" : "hide"}`}></span>
        </div>
    );
}
