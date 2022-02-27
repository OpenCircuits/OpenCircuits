import {useSharedDispatch} from "shared/utils/hooks/useShared";
import {ToggleSideNav} from "shared/state/SideNav";

import "./index.scss";


export const SideBarToggleButton = () => {
    const dispatch = useSharedDispatch();

    return (
            <div>
            <span title="Side Bar" role="button" tabIndex={0}
                  onClick={() => dispatch(ToggleSideNav())}>&#9776;</span>
        </div>
	);
}
