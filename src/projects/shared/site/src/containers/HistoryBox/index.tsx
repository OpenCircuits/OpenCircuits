import {useState} from "react";

import {useDocEvent}                          from "shared/site/utils/hooks/useDocEvent";
import {useEvent}                             from "shared/site/utils/hooks/useEvent";
import {useHistory}                           from "shared/site/utils/hooks/useHistory";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CloseHistoryBox} from "shared/site/state/ItemNav";

import {AdjustableElement} from "shared/site/components/AdjustableElement";

import "./index.scss";

import {Circuit} from "shared/api/circuit/public";


// TODO[model_refactor_api] - put LogEntry and CircuitOp somewhere that isn't internal, useHistory currently imports from internal
type LogEntry = ReturnType<typeof useHistory>["undoHistory"][number]
type CircuitOp = LogEntry["ops"][number]

interface OpInfo {
    displayName: string;
    extraInfo?: string;
}
const getOpInfo = (op: CircuitOp): OpInfo => {
    switch (op.kind) {
        case "PlaceComponentOp":
            return { displayName: "Place Component", extraInfo: `${op.c.kind} with id ${op.c.id} placed` };
        case "ConnectWireOp":
            return { displayName: "Connect Wire", extraInfo: `Wire with id ${op.w} created` };
        case "CreateICOp":
            return { displayName: "Create IC", extraInfo: `IC ${op.ic.metadata.name} with id ${op.ic.metadata.id} created` };
        case "ReplaceComponentOp":
            return { displayName: "Replace Component", extraInfo: `Replaced ${op.oldKind} with ${op.newKind}` };
        case "SetComponentPortsOp":
            return { displayName: "Set Component Ports", extraInfo: `Added ${op.addedPorts.length} ports, removed ${op.removedPorts.length} ports` };
        case "SetPropertyOp":
            return { displayName: "Set Property", extraInfo: `Changed property ${op.key} from ${op.oldVal} to ${op.newVal} on ${op.id}` };
        case "SplitWireOp":
            return { displayName: "Split Wire", extraInfo: `Split a wire, creating a node with id ${op.node.id}` };
        default:
            return { displayName: "Unrecognized operation" };
    }
}

type HistoryEntryProps = {
    op: CircuitOp;
    isRedo: boolean;
}
const HistoryEntry = ({ op, isRedo }: HistoryEntryProps) => {
    const [displayExtraInfo, setDisplayExtraInfo] = useState(true);

    const opInfo = getOpInfo(op);

    return (
        <div className={`historybox__entry ${isRedo ? "historybox__entry--dashed" : ""}`}
             role="button" tabIndex={0}
             onClick={(e) => {
                 // Necessary to stop child entries from collapsing the parent history entry
                 e.stopPropagation();
                 setDisplayExtraInfo(!displayExtraInfo);
             }}>
            <div className="historybox__entry__header">
                {opInfo.extraInfo && (<img src="img/icons/info.svg"
                                           height="24px"
                                           alt="Display extra info" />)}
                <span>{opInfo.displayName}</span>
            </div>
            {!displayExtraInfo && opInfo.extraInfo && <div className="historybox__entry__extrainfo">{opInfo.extraInfo}</div>}
        </div>
    );
}

type GroupActionEntryProps = {
    a: LogEntry;
    isRedo: boolean;
}
const GroupActionEntry = ({ a, isRedo }: GroupActionEntryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [displayExtraInfo, setDisplayExtraInfo] = useState(false);

    // TODO[model_refactor_api] - Decide if we want to nest single op entries or not
    // if (a.ops.length === 1) {
    //     return <HistoryEntry op={a.ops[0]} isRedo={isRedo} />
    // }

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
                    {/* {g.getCustomInfo() && (
                        <img src="img/icons/info.svg"
                             alt="Display extra info"
                             onClick={(e) => {
                                 // Necessary to stop child entries from displaying
                                 //  extra info about the parent history entry
                                 e.stopPropagation();
                                 setDisplayExtraInfo(!displayExtraInfo);
                             }} />
                    )} */}
                    <span>{a.clientData}</span>
                </div>
                <span className={`${isCollapsed ? "collapsed" : "" }`}>&rsaquo;</span>
            </div>
            {/* {displayExtraInfo && g.getCustomInfo?.()?.map((obj, i) =>
                <div key={`group-action-extrainfo-${i}`} className="historybox__groupentry__extrainfo">{obj}</div>
            )} */}
            {!isCollapsed && a.ops.map((op, i) => (
                <HistoryEntry key={`group-action-entry-${i}`}
                              op={op}
                              isRedo={isRedo} />
            ))}
            {!isCollapsed && a.ops.length === 0 && <div style={{ marginLeft: "10px" }}>Empty</div>}
        </div>
    );
}


type Props = {
    circuit: Circuit;
}
export const HistoryBox = ({ circuit }: Props) => {
    const { isOpen, isHistoryBoxOpen, curItemID } = useSharedSelector(
        (state) => ({ ...state.itemNav }),
    );
    const dispatch = useSharedDispatch();

    const { undoHistory, redoHistory } = useHistory(circuit);

    const [isDragging, setIsDragging] = useState(false);
    // useEvent("mousedrag", (_) => setIsDragging(true),  info.input, [setIsDragging]); // TODO
    useDocEvent("mouseup", () => setIsDragging(false), [setIsDragging]);

    // Make history box passthrough if dragging on canvas or from ItemNav
    const passthrough = isDragging || !!curItemID;

    return (
        <AdjustableElement
            className={(isHistoryBoxOpen ? "" : "hide")}
            initialWidth={240} initialHeight={400} minHeight={240}
            style={{
                pointerEvents: (passthrough ? "none" : undefined),
                opacity:       (passthrough ? 0.5    : undefined),
            }}>
            <div className={`historybox ${isOpen ? "" : "historybox__move"}`}
                 data-adjustable>
                <div data-adjustable>
                    <span data-adjustable>History</span>
                    <span role="button" tabIndex={0} data-adjustable
                          onClick={() => dispatch(CloseHistoryBox())}>×</span>
                </div>
                <div data-adjustable>
                    {[...redoHistory].map((a, i) =>
                        <GroupActionEntry key={`history-box-dashedentry-${i}`} a={a} isRedo />,
                    )}
                    { redoHistory.length > 0 && (<>
                        <div style={{ textAlign: "center", fontWeight: "bold" }}> Redo </div>
                        <div className="historybox__separator"></div>
                    </>)}
                    <div style={{ textAlign: "center", fontWeight: "bold" }}> Undo </div>
                    {[...undoHistory].reverse().map((a, i) =>
                        <GroupActionEntry key={`history-box-entry-${i}`} a={a} isRedo={false} />,
                    )}
                </div>
            </div>
        </AdjustableElement>
    );
}
