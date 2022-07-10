import React from 'react';



function hash(str, digits) {
    digits = digits || 8;
    const m = Math.pow(10, digits+1) - 1;
    const phi = Math.pow(10, digits) / 2 - 1;
    let n = 0;
    for (var i = 0; i < str.length; i++) {
        n = (n + phi * str.charCodeAt(i)) % m;
    }
    return n;
}

const randomColor = (() => {
    const Rand = (seed) => {
        let _seed = seed % 2147483647;
        if (_seed <= 0) _seed += 2147483646;

        const nextFloat = () => {
            const next = _seed * 16807 % 2147483647;
            _seed = next;
            return (next - 1) / 2147483646
        };

        return {
            randInt(min, max) {
                return Math.floor(nextFloat() * (max - min + 1)) + min;
            }
        }
    };

    return (hash) => {
        const r = Rand(hash ?? Math.floor(Math.random() * 2147483647));
        var h = r.randInt(0, 360);
        var s = r.randInt(42, 98);
        var l = r.randInt(40, 90);
        return `hsl(${h},${s}%,${l}%)`;
    };
})();



export default function Timeline({start, milestones, end}) {
    const H = 400;
    const TICK_H_LG = H/6;
    const TICK_H = TICK_H_LG*1/2;

    const BOX_W = 100 / (milestones.length) - 5;
    const BOX_H = 150;

    return (
        <div style={{ position: "relative", width: "100%", height: `${H}px` }}>

        {/* Display grid lines for the timeline */}
        <svg width="100%" height="100%">
        <g style={{ transform: "translate(0, 50%)" }}>
            <rect y={`-${TICK_H_LG/2}px`} width="1px" height={`${TICK_H_LG}px`} fill="gray" />
            <text y={`${-TICK_H_LG/2 - 5}px`} fill="gray" alignmentBaseline="baseline">{start}</text>

            <rect x="calc(100% - 1px)" y={`-${TICK_H_LG/2}px`} width="1px" height={`${TICK_H_LG}px`} fill="gray" />
            <text x="100%" y={`${-TICK_H_LG/2 - 5}px`} fill="gray" textAnchor="end" alignmentBaseline="baseline">{end}</text>

            { // Display other grid lines
                milestones
                    .map((_, i) => ((i + 1) / (milestones.length + 1) * 100))
                    .map((x, i) => <>
                        <rect x={`${x}%`} y={`-${TICK_H/2}px`} width="1px" height={`${TICK_H}px`} fill="gray" />
                        <text x={`${x}%`} y={`${(TICK_H/2 + 5) * ((i % 2 === 0) ? -1 : +1)}px`}
                              fill="gray" textAnchor="middle"
                              alignmentBaseline={(i % 2 === 0) ? "baseline" : "hanging"}>{milestones[i].date}</text>
                    </>)
            }
            <rect width="100%" height="1px" fill="gray"></rect>
        </g>
        </svg>

        {/* Display milestone boxes */}
        {milestones
            .map((m, i) => {
                const x = ((i + 1) / (milestones.length + 1) * 100);
                const y = ((i % 2 === 0) ? (TICK_H + 5) : (-(TICK_H + 5) - BOX_H));

                return (
                    <a href={`#milestone-${i+1}`} style={{ color: "inherit" }}>
                        <div style={{ position: "absolute",
                                    display: "flex", flexDirection: "column",
                                    left: `${x - BOX_W/2}%`, top: `calc(50% + ${y}px)`,
                                    width: `${BOX_W}%`, height: `${BOX_H}px`, borderRadius: "5px",
                                    backgroundColor: randomColor(hash(m.date + m.explanation))}}>
                            <div style={{ width: "100%", marginTop: "5px",
                                        flex: "0 1 auto",
                                        textAlign: "center", fontWeight: "bold",
                                        overflow: "hidden", textOverflow: "clip", whiteSpace: "nowrap" }}>
                                Milestone {i+1}
                            </div>
                            <div style={{ width: "100%", marginTop: "5px",
                                        flex: "1 1 auto",
                                        textAlign: "center",
                                        overflow: "clip", textOverflow: "ellipsis", whiteSpace: "break-spaces" }}>
                                {m.explanation}
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
