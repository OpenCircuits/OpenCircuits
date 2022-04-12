import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import {useMousePos} from "shared/utils/hooks/useMousePos";
import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {CloseHistoryBox} from "shared/state/ItemNav";

import "./index.scss";

type HistoryEntryProps = {
    a: Action;
}
const HistoryEntry = ({ a }: HistoryEntryProps) => {
    if (a instanceof GroupAction)
        return (<GroupActionEntry g={a}></GroupActionEntry>);
    return (
        <div className="historybox__entry"
             // Necessary to stop child entries from collapsing the parent history entry
             onClick={(e) => e.stopPropagation()}>
            {a.getName()}
        </div>
    );
}


type GroupActionEntryProps = {
    g: GroupAction;
}
const GroupActionEntry = ({ g }: GroupActionEntryProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

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
            <span>{g.getName()}</span>
            <span
                className={`historybox__groupentry__collapse_btn \
                            ${isCollapsed ? "historybox__groupentry__collapse_btn-collapsed" : "" }`}>
                &rsaquo;
            </span>
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

    let cname = "historybox " + (isOpen ? "" : "historybox__move");
    cname += isHistoryBoxOpen ? " " : " hide";

    const mouse = useMousePos();
    const { w, h } = useWindowSize();
    // if w > 720 then 240, elif w < 240 then -10, else w/2 - 130
    let initx = w > 720 ? 240 : w < 240 ? -10 : w / 2 - 130;
    // if h > 960 then 240, elif h < 720 then -10, else h/2 - 370
    let inity = h > 960 ? 240 : h < 720 ? -10 : h / 2 - 370;

    let [pos, set_pos] = useState({ x: initx, y: inity });
    let [len, set_len] = useState({ x: 240, y: 400 });

    // STart POSition before drag or resize
    let [stpos, set_stpos] = useState({ x: 0, y: 0 });
    // STart LENgth of box before drag or resize
    let [stlen, set_stlen] = useState({ x: 0, y: 0 });
    // start position of controller(mouse or touch) before ...
    let [stcrl, set_stcrl] = useState({ x: 0, y: 0 });
    // current position of MouSe or TouCH
    let [mstch, set_mstch] = useState({ x: 0, y: 0 });

    let [state, set_state] = useState({
        isMove_x: false,
        isMove_y: false,
        isDrag_x: false,
        isDrag_y: false,
        is_Title: false });

    function ctrlD(position: string, type: string, touch: React.Touch | undefined) {
        set_stpos({ x: pos.x, y: pos.y });
        set_stlen({ x: len.x, y: len.y });
        if (type === "mouse" && mouse !== undefined &&
            mouse.x !== undefined && mouse.y !== undefined) {
            set_stcrl({ x: mouse.x, y: mouse.y });
        } else if (type === "touch" && touch !== undefined) {
            set_stcrl({ x: touch.pageX, y: touch.pageY });
        } else {
            return;
        }

        state.isDrag_x = position.includes("e");
        state.isDrag_y = position.includes("s");
        state.isMove_x = position.includes("w");
        state.isMove_y = position.includes("n");
        state.is_Title = position.includes("t");
    }

    function ctrlM(type: string, touch: React.Touch | undefined) {
        if (type === "mouse" && mouse !== undefined) {
            mstch.x = mouse.x === undefined ? 0 : mouse.x;
            mstch.y = mouse.y === undefined ? 0 : mouse.y;
        } else if (type === "touch" && touch !== undefined) {
            mstch.x = touch.pageX;
            mstch.y = touch.pageY;
        } else {
            return;
        }

        if (state.isMove_x) {
            pos.x = stpos.x - stcrl.x + mstch.x;
            len.x = stlen.x + stcrl.x - mstch.x;
        }
        if (state.isMove_y) {
            pos.y = stpos.y - stcrl.y + mstch.y;
            len.y = stlen.y + stcrl.y - mstch.y;
        }
        if (state.isDrag_x) {
            len.x = stlen.x - stcrl.x + mstch.x;
        }
        if (state.isDrag_y) {
            len.y = stlen.y - stcrl.y + mstch.y;
        }
        if (state.is_Title) {
            pos.x = stpos.x - stcrl.x + mstch.x;
            pos.y = stpos.y - stcrl.y + mstch.y;
        }

        if (state.isMove_x && pos.x > stpos.x + stlen.x - 240) {
            pos.x = stpos.x + stlen.x - 240;
        }
        if (state.isMove_y && pos.y > stpos.y + stlen.y - 400) {
            pos.y = stpos.y + stlen.y - 400;
        }
        len.x = len.x < 240 ? 240 : len.x;
        len.y = len.y < 400 ? 400 : len.y;
    }

    ctrlM("mouse", undefined);

    function ctrlU() {
        set_state({
            isMove_x: false,
            isMove_y: false,
            isDrag_x: false,
            isDrag_y: false,
            is_Title: false });
        set_pos({ x: pos.x, y: pos.y });
        set_len({ x: len.x, y: len.y });
    }
    
    return (
        <div className={cname} style={{left:pos.x, top:pos.y, width:len.x+20, height:len.y+20}}>
            <div className="box" style={{width:len.x, height:len.y}}>
                <div className="title">
                    <span
                        onMouseDown={() => ctrlD("t", "mouse", undefined)}
                        onMouseUp={() => ctrlU()}
                        onTouchStart={(e) => ctrlD("t", "touch", e.touches.item(0))}
                        onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                        onTouchEnd={() => ctrlU()}>
                        History
                    </span>
                    <span onClick={() => dispatch(CloseHistoryBox())}>×</span>
                </div>
                <div className="content" style={{width: len.x, height: len.y-65}}>
                    {[...undoHistory].reverse().map((a, i) =>
                        <HistoryEntry key={`history-box-entry-${i}`} a={a}></HistoryEntry>
                    )}
                </div>
            </div>
            <div className="resizers">
                <div className="c nw"
                    onMouseDown={() => ctrlD("nw", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("nw", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}/>
                <div className="c ne"
                    onMouseDown={() => ctrlD("ne", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("ne", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}/>
                <div className="c sw"
                    onMouseDown={() => ctrlD("sw", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("sw", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}/>
                <div className="c se"
                    onMouseDown={() => ctrlD("se", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("se", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}/>

                <div className="e _n"
                    onMouseDown={() => ctrlD("n", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("n", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{left: 20, width: len.x-20}}/>
                <div className="e _s"
                    onMouseDown={() => ctrlD("s", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("s", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{left: 20, width: len.x-20}}/>
                <div className="e _w"
                    onMouseDown={() => ctrlD("w", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("w", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{top: 20, height: len.y-20}}/>
                <div className="e _e"
                    onMouseDown={() => ctrlD("e", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("e", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{top: 20, height: len.y-20}}/>
            </div>
        </div>
    );
}