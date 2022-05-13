import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CloseHistoryBox, OpenHistoryBox} from "shared/state/ItemNav";

import "./index.scss";


export const HistoryToggleButton = () => {
    const isHistoryBoxOpen = useSharedSelector(state => state.itemNav.isHistoryBoxOpen);
    const dispatch = useSharedDispatch();

    return (
        <div>
            <button className="header__left__history"
                    title="History"
                    onClick={() => {
                        if (isHistoryBoxOpen) dispatch(CloseHistoryBox());
                        else dispatch(OpenHistoryBox());
                    }}>
                <img src="img/icons/history-light.svg" ></img>
            </button>
        </div>
    );
}

