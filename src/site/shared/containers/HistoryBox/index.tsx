import {CircuitInfo} from "core/utils/CircuitInfo";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import "./index.scss";
import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";


type HistoryEntryProps = {
    a: Action;
}
const HistoryEntry = ({a}: HistoryEntryProps) => {
    if (a instanceof GroupAction) {
        return(<GroupActionEntry g = {a}></GroupActionEntry>)
    }
    return(<div className="historybox__entry">{a.getName()}</div>);
}


type GroupActionEntryProps = {
    g: GroupAction;
}
const GroupActionEntry = ({g}: GroupActionEntryProps) => {
    if (g.isEmpty()) {
        return null;
    }
    else if (g.getActions().length == 1) {
        return(<HistoryEntry a = {g.getActions()[0]}></HistoryEntry>);
    }
    return(
        <div className="historybox__groupentry">
            <span>Group Action</span>
            {g.getActions().map((a, i) => {
                return(<HistoryEntry key = {`group-action-entry-${i}`} a = {a}></HistoryEntry>);
            })}
        </div>
    );
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
                //   you could also declare a separate component for the GroupActionEntry so that it's all nice and separate
                //    then for the HTML we need to make it special and return a list of all the sub-actions using the `HistoryEntry` components
                return(<HistoryEntry key = {`history-box-entry-${i}`} a = {a}></HistoryEntry>)
            })}
        </div>
    );
}