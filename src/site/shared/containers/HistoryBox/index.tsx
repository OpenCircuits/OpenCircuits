import {CircuitInfo} from "core/utils/CircuitInfo";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import "./index.scss";


const thing = {
    someProperty: "String",
    someOtherPropetty: 5
    }


type Props = {
    info: CircuitInfo;
}
export const HistoryBox = ({ info }: Props) => {
    const {isOpen, isHistoryBoxOpen} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const {undoHistory, redoHistory} = useHistory(info);

    return (
        <div className="historybox" style={{
                display: (isHistoryBoxOpen ? "initial" : "none"),
                left: (isOpen ? "" : "0px"),
            }}>
            {info.history.getActions().reverse().map((a, i) => {
                return <div key={`history-box-entry-${i}`} className="historybox__entry">{a.getName()}</div>
            })}
        </div>
    );
}