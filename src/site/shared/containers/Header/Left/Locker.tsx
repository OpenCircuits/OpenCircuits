import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {ToggleCircuitLocked} from "shared/state/CircuitInfo";

import "./index.scss";


export const LockToggleButton = () => {
    const {isLocked} = useSharedSelector(
        state => ({ ...state.circuit })
    );
    const dispatch = useSharedDispatch();

	return (
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
	);
}
