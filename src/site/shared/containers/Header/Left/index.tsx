import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {ToggleCircuitLocked, SetCircuitName} from "shared/state/CircuitInfo";
import {ToggleSideNav} from "shared/state/SideNav";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderLeft = ({helpers}: Props) => {
    const {name, isSaved, isLocked, isLoggedIn, saving, error} = useSharedSelector(
        state => ({ ...state.circuit, isLoggedIn: state.user.isLoggedIn })
    );
    const dispatch = useSharedDispatch();

    return (
        <div className="header__left">
            <div>
                <span title="Side Bar" role="button" tabIndex={0}
                      onClick={() => dispatch(ToggleSideNav())}>&#9776;</span>
            </div>
            <div>
                <button className="header__left__lock"
                        title="Lock/Unlock Editing"
                        onClick={() => dispatch(ToggleCircuitLocked())}>
                    <img src="img/icons/lock_open.svg" className={isLocked ? "hide" : ""}
                         alt="Icon for unlocked lock" />
                    <img src="img/icons/lock.svg"      className={isLocked ? "" : "hide"}
                         alt="Icon for lock" />
                </button>
            </div>
            <div>
                <input title="Circuit Name" type="text"
                       value={name}
                       placeholder="Untitled Circuit*"
                       onChange={(s) => dispatch(SetCircuitName(s.target.value))}
                       onKeyUp={(ev) => {
                           // Make it so that pressing enter saves and loses focus on the name
                           if (ev.key === "Enter") {
                               ev.currentTarget.blur();
                               helpers.SaveCircuitRemote();
                           }
                       }}
                       alt="Name of project" />
            </div>
            <div>
                <button className={`header__left__save ${isSaved || !isLoggedIn ? "invisible" : ""}`}
                        title="Save the circuit remotely"
                        disabled={saving}
                        onClick={() => helpers.SaveCircuitRemote() }>Save</button>
            </div>
            <div className="header__left__saving__icons">
                <img src="img/icons/error.svg" className={error ? "" : "hide"}
                     title={`Error occured while saving: ${error}`} alt="Icon when save failed" />
                <span className={saving ? "" : "hide"} title="Saving..."></span>
            </div>
        </div>
    );
}
