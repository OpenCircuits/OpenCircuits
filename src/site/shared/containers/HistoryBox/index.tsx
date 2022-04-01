import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {ShiftAction} from "core/actions/ShiftAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import { RotateAction } from "core/actions/transform/RotateAction";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import {CloseHistoryBox} from "shared/state/ItemNav";

import "./index.scss";


type HistoryEntryProps = {
    a: Action;
}
const HistoryEntry = ({ a }: HistoryEntryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (a instanceof GroupAction)
        return (<GroupActionEntry g={a}></GroupActionEntry>);
    return (
        <div className="historybox__entry"
            onClick={(e) => {
                // Necessary to stop child entries from collapsing the parent history entry
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
            }}>
            <img className="historybox__entry__extrainfo__icon" src="img/icons/info.svg" alt="Display extra info"/>
            {a.getName()}
            {/* {(a instanceof ShiftAction || a instanceof TranslateAction || a instanceof RotateAction) &&
                <span
                    className={`historybox__entry__additionalinfo__collapse_btn \
                    ${isCollapsed ? "historybox__entry__additionalinfo__collapse_btn-collapsed" : "" }`}>
                </span>
            } */}
            
            {!isCollapsed && (a.getCustomInfo != undefined ?
                a.getCustomInfo().map((o, i) => {
                    return (
                        <div className="historybox__entry__extrainfo">{a.getCustomInfo?.()[i]}</div>
                    )
                }) :
                <div className="historybox__entry__extrainfo">Applied to 1 thing.</div>)
                // <div className="historybox__entry__extrainfo">{a.getCustomInfo()}</div>
            }
        </div>
    );
}


type AdditionalActionInformationProps = {
    a: Action;
}
const AdditionalActionInformation = ({ a }: AdditionalActionInformationProps) => {
    if (a instanceof ShiftAction)
        return (
            <div onClick={(e) => {
                    // Necessary to stop child entries from collapsing the parent history entry
                    e.stopPropagation();
                }}>
                <div>{"obj: " + a.getObj()}</div>
                <div>{"i: " + a.getI()}</div>
            </div>
        );
    else if (a instanceof TranslateAction)
        return (
            <div onClick={(e) => {
                    // Necessary to stop child entries from collapsing the parent history entry
                    e.stopPropagation();
                }}>
                {a.getObjs().map((o, i) => {
                    return(
                        <div>{o}: ({Math.round(a.getInitialPositions()[i].x)}, {Math.round(a.getInitialPositions()[i].y)}) to
                                ({Math.round(a.getTargetPositions()[i].x)}, {Math.round(a.getTargetPositions()[i].y)})
                        </div>);
                })}
            </div>
        );
    else if (a instanceof RotateAction)
        return (
            <div onClick={(e) => {
                    // Necessary to stop child entries from collapsing the parent history entry
                    e.stopPropagation();
                }}>
                {a.getObjs().map((o, i) => {
                    return(<div>{o}: {Math.round(a.getInitialAngles()[i])} to {Math.round(a.getFinalAngles()[i])}</div>);
                })}
            </div>
        );
    return (
        <div></div>
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
            <img className="historybox__groupentry__extrainfo__icon" src="img/icons/info.svg" alt="Display extra info"
                onClick={(e) => {
                    // Necessary to stop child entries from displaying extra info about the parent history entry
                    e.stopPropagation();
                    setDisplayExtraInfo(!displayExtraInfo);
                }}/>
            <span>{g.getName()}</span>
            <span
                className={`historybox__groupentry__collapse_btn \
                            ${isCollapsed ? "historybox__groupentry__collapse_btn-collapsed" : "" }`}>
                &rsaquo;
            </span>
            {!isCollapsed && g.getActions().map((a, i) => {
                return(<HistoryEntry key={`group-action-entry-${i}`} a={a}></HistoryEntry>);
            })}

            {displayExtraInfo &&
                <div className="historybox__groupentry__extrainfo">{g.getCustomInfo()}</div>
            }
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