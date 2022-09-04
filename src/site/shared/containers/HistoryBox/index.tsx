import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {useDocEvent}                          from "shared/utils/hooks/useDocEvent";
import {useEvent}                             from "shared/utils/hooks/useEvent";
import {useHistory}                           from "shared/utils/hooks/useHistory";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseHistoryBox} from "shared/state/ItemNav";

import {AdjustableElement} from "shared/components/AdjustableElement";

import "./index.scss";


type HistoryEntryProps = {
    a: Action;
    isRedo: boolean;
}
const HistoryEntry = ({ a, isRedo }: HistoryEntryProps) => {
    const [displayExtraInfo, setDisplayExtraInfo] = useState(true);
    if (a instanceof GroupAction)
        return (<GroupActionEntry g={a} isRedo={isRedo} />);
    return (
        <div className={`historybox__entry ${isRedo ? "historybox__entry--dashed" : ""}`}
             role="button" tabIndex={0}
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setDisplayExtraInfo(!displayExtraInfo);
             }}>
            <div className="historybox__entry__header">
                {a.getCustomInfo &&
                    (<img src="img/icons/info.svg"
                          height="24px"
                          alt="Display extra info" />)}
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

    return (
        <div className={`historybox__groupentry ${isRedo ? "historybox__groupentry--dashed" : ""}`}
             role="button" tabIndex={0}
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setIsCollapsed(!isCollapsed);
             }}>
            <div className="historybox__groupentry__header">
                <div>
                    {g.getCustomInfo() && (
                        <img src="img/icons/info.svg"
                             alt="Display extra info"
                             onClick={(e) => {
                                 // Necessary to stop child entries from displaying
                                 //  extra info about the parent history entry
                                 e.stopPropagation();
                                 setDisplayExtraInfo(!displayExtraInfo);
                             }} />
                    )}
                    <span>{g.getName()}</span>
                </div>
                <span className={`${isCollapsed ? "collapsed" : "" }`}>&rsaquo;</span>
            </div>
            {displayExtraInfo && g.getCustomInfo?.()?.map((obj, i) =>
                <div key={`group-action-extrainfo-${i}`} className="historybox__groupentry__extrainfo">{obj}</div>
            )}
            {!isCollapsed && g.getActions().map((a, i) => (
                <HistoryEntry key={`group-action-entry-${i}`}
                              a={a}
                              isRedo={isRedo} />
            ))}
            {!isCollapsed && g.isEmpty() && <div style={{ marginLeft: "10px" }}>Empty</div>}
        </div>
    );
}


type Props = {
    info: CircuitInfo;
}
export const HistoryBox = ({ info }: Props) => {
    const { isOpen, isHistoryBoxOpen, curItemID } = useSharedSelector(
        (state) => ({ ...state.itemNav }),
    );
    const dispatch = useSharedDispatch();

    const { undoHistory, redoHistory } = useHistory(info);

    const [isDragging, setIsDragging] = useState(false);
    useEvent("mousedrag", (_) => setIsDragging(true),  info.input, [setIsDragging]);
    useDocEvent("mouseup", () => setIsDragging(false), [setIsDragging]);

    // Make history box passthrough if dragging on canvas or from ItemNav
    const passthrough = isDragging || !!curItemID;

    return (
        <AdjustableElement
            initialWidth={240} initialHeight={400} minHeight={240}
            style={{
                pointerEvents: (passthrough ? "none" : undefined),
                opacity:       (passthrough ? 0.5    : undefined),
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
