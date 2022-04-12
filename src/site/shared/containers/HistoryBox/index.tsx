import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import {CloseHistoryBox} from "shared/state/ItemNav";

import "./index.scss";


type HistoryEntryProps = {
    a: Action;
}
const HistoryEntry = ({ a }: HistoryEntryProps) => {
    const [displayExtraInfo, setDisplayExtraInfo] = useState(true);

    if (a instanceof GroupAction)
        return (<GroupActionEntry g={a}></GroupActionEntry>);
    return (
        <div className="historybox__entry"
            onClick={(e) => {
                // Necessary to stop child entries from collapsing the parent history entry
                e.stopPropagation();
                setDisplayExtraInfo(!displayExtraInfo);
            }}>
            <div className="historybox__entry__header">
                {a.getCustomInfo &&
                    <img className="historybox__entry__extrainfo__icon" src="img/icons/info.svg" alt="Display extra info"/>
                }
                <span className="historybox__entry__actionname">
                    {a.getName()}
                </span>
            </div>
            {!displayExtraInfo && a.getCustomInfo &&
                a.getCustomInfo()?.map((obj, i) => {
                    return (
                        <div key={`entry-extrainfo-${i}`} className="historybox__entry__extrainfo">{obj}</div>
                    )
                })
            }
        </div>
    );
}

type GroupActionEntryProps = {
    g: GroupAction;
}
const GroupActionEntry = ({ g }: GroupActionEntryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [displayExtraInfo, setDisplayExtraInfo] = useState(false);

    if (g.isEmpty())
        return null;
    if (g.getActions().length === 1)
        return (<HistoryEntry a={g.getActions()[0]}></HistoryEntry>);

    return (
        <div className="historybox__groupentry"
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setIsCollapsed(!isCollapsed);
             }}>
            <div className="historybox__groupentry__header">
                {g.getCustomInfo() && <img className="historybox__groupentry__extrainfo__icon" src="img/icons/info.svg" alt="Display extra info"
                    onClick={(e) => {
                        // Necessary to stop child entries from displaying extra info about the parent history entry
                        e.stopPropagation();
                        setDisplayExtraInfo(!displayExtraInfo);
                    }}/>}
                <span className="historybox__groupentry__actionname">
                    {g.getName()}
                </span>
                <span
                    className={`historybox__groupentry__collapse_btn \
                                ${isCollapsed ? "historybox__groupentry__collapse_btn-collapsed" : "" }`}>
                    &rsaquo;
                </span>
            </div>
            {displayExtraInfo &&
                g.getCustomInfo()?.map((obj, i) => {
                    return (
                        <div key={`group-action-extrainfo-${i}`} className="historybox__groupentry__extrainfo">{obj}</div>
                    )
                })
            }
            {!isCollapsed && g.getActions().map((a, i) => {
                return(<HistoryEntry key={`group-action-entry-${i}`} a={a}></HistoryEntry>);
            })}
        </div>
    );
}


type Props = {
    info: CircuitInfo;
}
export const HistoryBox = ({ info }: Props) => {
    const { isOpen, isHistoryBoxOpen } = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const { undoHistory, redoHistory } = useHistory(info);

    return (
        <div className={`historybox ${isOpen ? "" : "historybox__move"} ${isHistoryBoxOpen ? "" : "hide"}`}>
            <div>
                <span>History</span>
                <span onClick={() => dispatch(CloseHistoryBox())}>×</span>
            </div>
            <div>
                {[...undoHistory].reverse().map((a, i) =>
                    <HistoryEntry key={`history-box-entry-${i}`} a={a}></HistoryEntry>
                )}
            </div>
        </div>

    );
}