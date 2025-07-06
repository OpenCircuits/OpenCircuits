import {useEffect} from "react";

import {useAPIMethods}                        from "shared/site/utils/ApiMethods";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";
import {useCurDesigner}                       from "shared/site/utils/hooks/useDesigner";

import {SetCircuitName, ToggleCircuitLocked} from "shared/site/state/CircuitInfo";
import {CloseHistoryBox, OpenHistoryBox}     from "shared/site/state/ItemNav";
import {ToggleSideNav}                       from "shared/site/state/SideNav";

import {InputField} from "shared/site/components/InputField";

import historyLightIcon from "./history-light.svg";
import lockOpenIcon     from "./lock_open.svg";
import lockIcon         from "./lock.svg";
import contentCopyIcon  from "./content_copy.svg";
import errorIcon        from "./error.svg";

import "./index.scss";


export const HeaderLeft = () => {
    const designer = useCurDesigner(), circuit = designer.circuit;
    const { id, name, isSaved, isLocked, isLoggedIn, isHistoryBoxOpen, saving, error } = useSharedSelector(
        (state) => ({
            ...state.circuit,
            isLoggedIn:       state.user.isLoggedIn,
            isHistoryBoxOpen: state.itemNav.isHistoryBoxOpen,
        })
    );
    const dispatch = useSharedDispatch();
    const { SaveCircuitRemote, DuplicateCircuitRemote } = useAPIMethods(circuit);

    // Sync circuit's name with the redux state name
    useEffect(() => circuit.subscribe((ev) => {
        if (ev.type !== "metadata" || ev.change !== "name")
            return;
        dispatch(SetCircuitName(circuit.name));
    }));

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
                <img src={historyLightIcon} alt="History box icon (light)"></img>
            </button>

            <button type="button" title="Lock/Unlock Editing"
                    className="header__left__lock"
                    onClick={() => dispatch(ToggleCircuitLocked())}>
                <img src={lockOpenIcon} className={isLocked ? "hide" : ""}
                     width="18px" height="18px" alt="Icon for unlocked lock" />
                <img src={lockIcon} className={isLocked ? "" : "hide"}
                     width="18px" height="18px" alt="Icon for lock" />
            </button>

            <InputField title="Circuit Name" type="text" value={name}
                        placeholder="Untitled Circuit*" alt="Name of project"
                        onChange={(s) => circuit.name = s.target.value}
                        onEnter={() => SaveCircuitRemote()} />

            <button type="button" title="Save the circuit remotely" disabled={saving}
                    className={`header__left__save ${isSaved || !isLoggedIn ? "hide" : ""}`}
                    onClick={() => SaveCircuitRemote()}>
                Save
            </button>

            <button type="button" title="Duplicate the circuit"
                    className={`header__left__duplicate ${!isLoggedIn || id === "" ? "hide" : ""}`}
                    onClick={() => DuplicateCircuitRemote()}>
                <img src={contentCopyIcon} height="100%" alt="Copy circuit" />
            </button>

            <img src={errorIcon} className={error ? "" : "hide"}
                 title={`Error occured while saving: ${error}`} alt="Icon when save failed" />
            <span title="Saving..." className={`header__left__saving ${saving ? "" : "hide"}`}></span>
        </div>
    );
}
