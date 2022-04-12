import {useState} from "react";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {useHistory} from "shared/utils/hooks/useHistory";

import {useMousePos} from "shared/utils/hooks/useMousePos";
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

let width = screen.availWidth;
let hight = screen.availHeight;
let posx = width > 720 ? 240 : width / 2 - 130;
let posy = hight > 1200 ? 240 : hight / 2 - 370;
posy = posy < -10 ? -10 : posy;
let lenx = 240, leny = 400;

let stposx = 240, stposy = 240;
let stlenx = 240, stleny = 400;
let stcrlx = 0, stcrly = 0;
let ctrlx = 0, ctrly = 0;

let isMove_x = false, isMove_y = false;
let isDrag_x = false, isDrag_y = false;
let is_Title = false;

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

    let mouse = useMousePos();

    function ctrlD(position: string, type: string, touch: React.Touch | undefined) {
        stposx = posx;
        stposy = posy;
        stlenx = lenx;
        stleny = leny;
        if (type === "mouse" && mouse !== undefined) {
            stcrlx = mouse.x === undefined ? 0 : mouse.x;
            stcrly = mouse.y === undefined ? 0 : mouse.y;
        }
        if (type === "touch" && touch !== undefined) {
            stcrlx = touch.pageX;
            stcrly = touch.pageY;
        }

        isDrag_x = position === "e" || position === "se" || position === "ne";
        isDrag_y = position === "s" || position === "se" || position === "sw";
        isMove_x = position === "w" || position === "nw" || position === "sw";
        isMove_y = position === "n" || position === "nw" || position === "ne";
        is_Title = position === "t";
    }

    function ctrlM(type: string, touch: React.Touch | undefined) {
        if (type === "mouse" && mouse !== undefined) {
            ctrlx = mouse.x === undefined ? 0 : mouse.x;
            ctrly = mouse.y === undefined ? 0 : mouse.y;
        } else if (type === "touch" && touch !== undefined) {
            ctrlx = touch.pageX;
            ctrly = touch.pageY;
        }

        if (isMove_x) {
            posx = stposx - stcrlx + ctrlx;
            lenx = stlenx + stcrlx - ctrlx;
        }
        if (isMove_y) {
            posy = stposy - stcrly + ctrly;
            leny = stleny + stcrly - ctrly;
        }
        if (isDrag_x) {
            lenx = stlenx - stcrlx + ctrlx;
        }
        if (isDrag_y) {
            leny = stleny - stcrly + ctrly;
        }
        if (is_Title) {
            posx = stposx - stcrlx + ctrlx;
            posy = stposy - stcrly + ctrly;
        }

        if (isMove_x && posx > stposx + stlenx - 240) {
            posx = stposx + stlenx - 240;
        }
        if (isMove_y && posy > stposy + stleny - 400) {
            posy = stposy + stleny - 400;
        }
        lenx = lenx < 240 ? 240 : lenx;
        leny = leny < 400 ? 400 : leny;
    }

    ctrlM("mouse", undefined);

    function ctrlU() {
        isMove_x = false;
        isMove_y = false;
        isDrag_x = false;
        isDrag_y = false;
        is_Title = false;
    }
    
    return (
        <div className={cname} style={{left:posx, top:posy, width:lenx+20, height:leny+20}}>
            <div className="box" style={{width:lenx, height:leny}}>
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
                <div className="content" style={{width: lenx, height: leny-65}}>
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
                    style={{left: 20, width: lenx-20}}/>
                <div className="e _s"
                    onMouseDown={() => ctrlD("s", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("s", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{left: 20, width: lenx-20}}/>
                <div className="e _w"
                    onMouseDown={() => ctrlD("w", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("w", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{top: 20, height: leny-20}}/>
                <div className="e _e"
                    onMouseDown={() => ctrlD("e", "mouse", undefined)}
                    onMouseUp={() => ctrlU()}
                    onTouchStart={(e) => ctrlD("e", "touch", e.touches.item(0))}
                    onTouchMove={(e) => ctrlM("touch", e.touches.item(0))}
                    onTouchEnd={() => ctrlU()}
                    style={{top: 20, height: leny-20}}/>
            </div>
        </div>
    );
}