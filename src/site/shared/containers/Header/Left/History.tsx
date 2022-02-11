import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CloseHistoryBox, OpenHistoryBox} from "shared/state/ItemNav";

import "./index.scss";


export const HistoryToggleButton = () => {
    const {isHistoryBoxOpen} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    return (
        <div>
            <div className="header__left__history">
                <button  title="History" onClick={() => {
                    if (isHistoryBoxOpen) dispatch(CloseHistoryBox());
                    else dispatch(OpenHistoryBox());
                }}>
                    <img src="img/icons/history.svg" ></img>
                </button>
            </div>
        </div>
    );
}

