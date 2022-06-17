import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import {AdjustableElement} from "shared/components/AdjustableElement";

import {CloseHistoryBox} from "shared/state/ItemNav";

import "./index.scss";
import {useEvent} from "shared/utils/hooks/useEvent";


type HistoryEntryProps = {
    a: Action;
    isRedo: boolean;
}
const HistoryEntry = ({ a, isRedo }: HistoryEntryProps) => {
    const [displayExtraInfo, setDisplayExtraInfo] = useState(true);
    if (a instanceof GroupAction)
        return (<GroupActionEntry g={a} isRedo={isRedo}></GroupActionEntry>);
    return (
        <div className={`historybox__entry ${isRedo ? "historybox__entry--dashed" : ""}`}
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setDisplayExtraInfo(!displayExtraInfo);
             }}>
            <div className="historybox__entry__header">
                {a.getCustomInfo &&
                    <img src="img/icons/info.svg"
                         height="24px"
                         alt="Display extra info" />
                }
                <span>{a.getName()}</span>
            </div>
            {!displayExtraInfo && a.getCustomInfo?.()?.map((obj, i) =>
                <div key={`entry-extrainfo-${i}`} className="historybox__entry__extrainfo">{obj}</div>
            )}
        </div>
    );
}

type GroupActionEntryProps = {
    g: GroupAction;
    isRedo: boolean;
}
const GroupActionEntry = ({ g, isRedo }: GroupActionEntryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [displayExtraInfo, setDisplayExtraInfo] = useState(false);

    if (g.isEmpty())
        return null;
    if (g.getActions().length === 1)
        return (<HistoryEntry a={g.getActions()[0]} isRedo={isRedo}></HistoryEntry>);
    return (
        <div className={`historybox__groupentry ${isRedo ? "historybox__groupentry--dashed" : ""}`}
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setIsCollapsed(!isCollapsed);
             }}>
            <div className="historybox__groupentry__header">
                <div>
                    {g.getCustomInfo() &&
                        <img src="img/icons/info.svg"
                             onClick={(e) => {
                                 // Necessary to stop child entries from displaying
                                 //  extra info about the parent history entry
                                 e.stopPropagation();
                                 setDisplayExtraInfo(!displayExtraInfo);
                             }}
                             alt="Display extra info" />
                    }
                    <span>{g.getName()}</span>
                </div>
                <span className={`${isCollapsed ? "collapsed" : "" }`}>&rsaquo;</span>
            </div>
            {displayExtraInfo && g.getCustomInfo?.()?.map((obj, i) =>
                <div key={`group-action-extrainfo-${i}`} className="historybox__groupentry__extrainfo">{obj}</div>
            )}
            {!isCollapsed && g.getActions().map((a, i) => {
                return (<HistoryEntry key={`group-action-entry-${i}`} a={a} isRedo={isRedo}></HistoryEntry>);
            })}
        </div>
    );
}


type Props = {
    info: CircuitInfo;
}
export const HistoryBox = ({ info }: Props) => {
    const { isOpen, isHistoryBoxOpen } = useSharedSelector(
        state => ({ ...state.itemNav }),
    );
    const dispatch = useSharedDispatch();

    const { undoHistory, redoHistory } = useHistory(info);

    const [isDragging, setIsDragging] = useState(false);
    useEvent("mousedrag", (_) => setIsDragging(true),  info.input, [setIsDragging]);
    useEvent("mouseup",   (_) => setIsDragging(false), info.input, [setIsDragging]);


    return (
        <AdjustableElement
            initialWidth={240} initialHeight={400} minHeight={240}
            style={{
                pointerEvents: (isDragging ? "none" : undefined),
                opacity:       (isDragging ? 0.5    : undefined),
            }}>
            <div className={`historybox ${isOpen ? "" : "historybox__move"} ${isHistoryBoxOpen ? "" : "hide"}`}
                 data-adjustable>
                <div data-adjustable>
                    <span data-adjustable>History</span>
                    <span role="button" tabIndex={0} data-adjustable
                          onClick={() => dispatch(CloseHistoryBox())}>×</span>
                </div>
                <div data-adjustable>
                    {[...redoHistory].map((a, i) =>
                        <HistoryEntry key={`history-box-dashedentry-${i}`} a={a} isRedo />,
                    )}
                    { redoHistory.length > 0 && (<>
                        <div style={{ textAlign: "center", fontWeight: "bold" }}> Redo </div>
                        <div className="historybox__separator"></div>
                    </>)}
                    <div style={{ textAlign: "center", fontWeight: "bold" }}> Undo </div>
                    {[...undoHistory].reverse().map((a, i) =>
                        <HistoryEntry key={`history-box-entry-${i}`} a={a} isRedo={false} />,
                    )}
                </div>
            </div>
        </AdjustableElement>
    );
}