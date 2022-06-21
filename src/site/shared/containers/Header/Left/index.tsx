import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {SetCircuitName} from "shared/state/CircuitInfo";

import {InputField} from "shared/components/InputField";

import {HistoryToggleButton} from "./HistoryToggleButton";
import {LockToggleButton}    from "./LockToggleButton";
import {SideBarToggleButton} from "./SideBarToggleButton";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderLeft = ({ helpers }: Props) => {
    const { id, name, isSaved, isLoggedIn, saving, error } = useSharedSelector(
        state => ({ ...state.circuit, isLoggedIn: state.user.isLoggedIn })
    );
    const dispatch = useSharedDispatch();

    return (
        <div className="header__left">
            <SideBarToggleButton />
            <HistoryToggleButton />
            <LockToggleButton />
            <div>
                <InputField title="Circuit Name" type="text"
                            value={name}
                            placeholder="Untitled Circuit*"
                            alt="Name of project"
                            onChange={(s) => dispatch(SetCircuitName(s.target.value))}
                            onEnter={() => helpers.SaveCircuitRemote()} />
            </div>
            <div>
                <button type="button"
                        className={`header__left__save ${isSaved || !isLoggedIn ? "hide" : ""}`}
                        title="Save the circuit remotely"
                        disabled={saving}
                        onClick={() => helpers.SaveCircuitRemote()}>Save</button>
            </div>
            <div>
                <button type="button"
                        className={`header__left__duplicate ${!isLoggedIn || id === "" ? "hide" : ""}`}
                        title="Duplicate the circuit"
                        onClick={() => helpers.DuplicateCircuitRemote()}>
                    <img src="img/icons/content_copy.svg" height="100%" alt="Copy circuit" />
                </button>
            </div>
            <div className="header__left__saving__icons">
                <img src="img/icons/error.svg" className={error ? "" : "hide"}
                     title={`Error occured while saving: ${error}`} alt="Icon when save failed" />
                <span className={saving ? "" : "hide"} title="Saving..."></span>
            </div>
        </div>
    );
}
