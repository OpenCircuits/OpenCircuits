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
const HistoryEntry = ({a}: HistoryEntryProps) => {
    if (a instanceof GroupAction)
        return(<GroupActionEntry g={a}></GroupActionEntry>)
    return(<div className="historybox__entry">{a.getName()}</div>);
}


type GroupActionEntryProps = {
    g: GroupAction;
}
const GroupActionEntry = ({g}: GroupActionEntryProps) => {
    if (g.isEmpty())
        return null;
    if (g.getActions().length === 1) {
        return(<HistoryEntry a={g.getActions()[0]}></HistoryEntry>);
    }
    return (
        <div className="historybox__groupentry">
            <span>Group Action</span>
            {g.getActions().map((a, i) => {
                return(<HistoryEntry key={`group-action-entry-${i}`} a={a}></HistoryEntry>);
            })}
        </div>
    );
}

let posx = 240, posy = 240;
let lenx = 240, leny = 400;

let stposx = 240, stposy = 240;
let stlenx = 240, stleny = 400;
let stmosx = 0, stmosy = 0;

let isMove_x = false, isMove_y = false;
let isDrag_x = false, isDrag_y = false;
let is_Title = false;

type Props = {
    info: CircuitInfo;
}
export const HistoryBox = ({ info }: Props) => {
    const {isOpen, isHistoryBoxOpen} = useSharedSelector(
        state => ({ ...state.itemNav })
    );
    const dispatch = useSharedDispatch();

    const {undoHistory} = useHistory(info);

    let cname = "historybox " + (isOpen ? "" : "historybox__move");
    cname += isHistoryBoxOpen ? " " : " hide";

    let mouse = useMousePos();

    function mouseD(type: string) {
        if (mouse.x === undefined || mouse.y === undefined) {
            return;
        }
        stposx = posx;
        stlenx = lenx;
        stmosx = mouse.x;
        stposy = posy;
        stleny = leny;
        stmosy = mouse.y;

        isDrag_x = type === "e" || type === "se" || type === "ne";
        isDrag_y = type === "s" || type === "se" || type === "sw";
        isMove_x = type === "w" || type === "nw" || type === "sw";
        isMove_y = type === "n" || type === "nw" || type === "ne";
        is_Title = type === "t";
    }

    function mouseU() {
        isMove_x = false;
        isMove_y = false;
        isDrag_x = false;
        isDrag_y = false;
        is_Title = false;
    }

    if (mouse.x!==undefined && mouse.y!==undefined) {
        if (isMove_x) {
            posx = stposx - stmosx + mouse.x;
            lenx = stlenx + stmosx - mouse.x;
        }
        if (isMove_y) {
            posy = stposy - stmosy + mouse.y;
            leny = stleny + stmosy - mouse.y;
        }
        if (isDrag_x) {
            lenx = stlenx - stmosx + mouse.x;
        }
        if (isDrag_y) {
            leny = stleny - stmosy + mouse.y;
        }
        if (is_Title) {
            posx = stposx - stmosx + mouse.x;
            posy = stposy - stmosy + mouse.y;
        }

        if (posx > stposx + stlenx - 240 && isMove_x) {
            posx = stposx + stlenx - 240;
        }
        if (posy > stposy + stleny - 400 && isMove_y) {
            posy = stposy + stleny - 400;
        }
        if (lenx < 240) {
            lenx = 240;
        }
        if (leny < 400) {
            leny = 400;
        }
    }

    return (
        <div className={cname} style={{left:posx, top:posy, width:lenx+20, height:leny+20}}>
            <div className="box" style={{width:lenx, height:leny}}>
                <div className="title">
                    <span onMouseDown={() => mouseD("t")} onMouseUp={() => mouseU()}>
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
                    onMouseDown={() => mouseD("nw")}
                    onMouseUp={() => mouseU()}/>
                <div className="c ne"
                    onMouseDown={() => mouseD("ne")}
                    onMouseUp={() => mouseU()}/>
                <div className="c sw"
                    onMouseDown={() => mouseD("sw")}
                    onMouseUp={() => mouseU()}/>
                <div className="c se"
                    onMouseDown={() => mouseD("se")}
                    onMouseUp={() => mouseU()}/>

                <div className="e _n"
                    onMouseDown={() => mouseD("n")}
                    onMouseUp={() => mouseU()}
                    style={{left: 20, width: lenx-20}}/>
                <div className="e _s"
                    onMouseDown={() => mouseD("s")}
                    onMouseUp={() => mouseU()}
                    style={{left: 20, width: lenx-20}}/>
                <div className="e _w"
                    onMouseDown={() => mouseD("w")}
                    onMouseUp={() => mouseU()}
                    style={{top: 20, height: leny-20}}/>
                <div className="e _e"
                    onMouseDown={() => mouseD("e")}
                    onMouseUp={() => mouseU()}
                    style={{top: 20, height: leny-20}}/>
            </div>
        </div>
    );
}
