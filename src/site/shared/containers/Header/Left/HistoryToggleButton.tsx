import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseHistoryBox, OpenHistoryBox} from "shared/state/ItemNav";

import "./index.scss";


export const HistoryToggleButton = () => {
    const isHistoryBoxOpen = useSharedSelector((state) => state.itemNav.isHistoryBoxOpen);
    const dispatch = useSharedDispatch();

    return (
        <div>
            <button type="button"
                    className="header__left__history"
                    title="History"
                    onClick={() => {
                        if (isHistoryBoxOpen)
                            dispatch(CloseHistoryBox());
                        else
                            dispatch(OpenHistoryBox());
                    }}>
                <img src="img/icons/history-light.svg" alt="History box icon (light)"></img>
            </button>
        </div>
    );
}
