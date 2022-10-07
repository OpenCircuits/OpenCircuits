import {useEffect, useState} from "react";
import {ColorToHex}          from "svg2canvas";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Oscilloscope} from "analog/models/eeobjects";

import {NetlistAnalysis}  from "analog/models/sim/Netlist";
import {CircuitToNetlist} from "analog/models/sim/NetlistGenerator";

import {InputField} from "shared/components/InputField";

import {useAnalogDispatch, useAnalogSelector} from "site/analog/utils/hooks/useAnalog";

import {SetHasData, SetSimMappings} from "site/analog/state/Sim";

import "./index.scss";


function HSLToHex(h: number, s: number, l: number) {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h/30) % 12;
        return Math.floor(255 * (l - a * Math.max(Math.min(k-3, 9-k, 1), -1)));
    }
    return ColorToHex({ r: f(0), g: f(8), b: f(4) });
}
function GetCol(i: number, _len: number) {
    const NiceColors = ["#c74440", "#2d70b3", "#388c46", "#fa7e19", "#6042a6"];
    if (i < NiceColors.length)
        return NiceColors[i];
    return HSLToHex(Math.random()*360, 0.8, 0.45);
}

type Props = {
    info: AnalogCircuitInfo;
}
export const SimButtons = ({ info }: Props) => {
    const dispatch = useAnalogDispatch();
    const { name, hasData, hasMappings } = useAnalogSelector(
        (state) => ({ name: state.circuit.name, ...state.sim })
    );

    const [analysis, setAnalysis] = useState<NetlistAnalysis | undefined>({
        kind: "tran", tstep: "1ms", tstop: "0.45s", tstart: "0", tmax: "0ms",
    });

    const Simulate = () => {
        info.sim?.run();
        info.renderer.render();

        // Add all current plots to all current Oscilloscopes
        const o = info.designer.getObjects().filter((a) => a instanceof Oscilloscope) as Oscilloscope[];
        o.forEach((o) => {
            o.setConfig({
                ...o.getConfig(),
                vecs: Object.fromEntries(info.sim!.getFullVecIDs().map(
                    (key, i, arr) => [key, {
                        // Last data-array is x/time data, disabled by default
                        enabled: (i < arr.length-1),
                        color:   GetCol(i, arr.length),
                    }]
                )),
            });
        });

        dispatch(SetHasData(true));
    };

    const Upload = () => {
        const [netlist, data] = CircuitToNetlist(name, analysis!, info.designer);
        info.sim?.uploadNetlist(netlist);

        dispatch(SetSimMappings(data));
    };


    // INITIALLY UPLOAD CAUSE IM TIRED OF DOING IT MANUALLY
    useEffect(() => {
        if (info.designer.getAll().length > 0) {
            try {
                Upload();
                Simulate();
            } catch (e) {
                console.error("Failed to upload:", e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // --------------



    // TODO:
    // NOTE: Ngspice requires that the following topological constraints are satisfied:
    //   > The circuit cannot contain a loop of voltage sources and/or inductors and cannot
    //      contain a cut-set of current sources and/or capacitors.
    //   > Each node in the circuit must have a dc path to ground.
    //   > Every node must have at least two connections

    return (<>
        {analysis?.kind === "tran" && (<div className="sim-analysis-panel">
            <div>Transient Analysis</div>
            {Object.entries(analysis).filter(([key]) => key !== "kind").map(([key, val]) => (
                <div key={`sim-analysis-panel-${key}`}>
                    {key}:
                    <InputField
                        type="text"
                        value={val}
                        onChange={(e) => setAnalysis({ ...analysis, [key]: e.target.value })} />
                </div>
            ))}
        </div>)}
        <div className="sim-buttons">
            <button type="button" disabled={!hasMappings} onClick={Simulate}>Sim</button>

            <button type="button" disabled={!analysis} onClick={Upload}>Upload</button>

            <select value={analysis?.kind ?? ""} onChange={(e) => {
                const val = e.target.value as NetlistAnalysis["kind"];
                switch (val) {
                case "op":
                    setAnalysis({ kind: "op" });
                    return;
                case "tran":
                    setAnalysis({ kind: "tran", tstep: "1ms", tstop: "1s", tstart: "0", tmax: "0ms" })
                }
            }}>
                <option value="" disabled hidden>Type</option>
                <option value="op">DC</option>
                {/* <option value="dc">DC Sweep</option> */}
                <option value="tran">Trans</option>
            </select>

            <button type="button" disabled={!hasData} onClick={() => {
                // console.log(info.sim?.getPlotIDs());
                // const curPlot = info.sim?.getCurPlotID();
                // console.log("cur", curPlot);
                // const vecs = info.sim?.getVecIDs(curPlot);
                // console.log("vecs", vecs);
                // const vecIDs = vecs?.map(v => `${curPlot!}.${v}` as const);

                // const dataLens = vecIDs?.map(id => info.sim?.getVecLen(id));
                // console.log(dataLens);

                // const datas = vecIDs?.map((id => info.sim?.getVecData(id)));
                // console.log(datas);
                // // info.sim?.printData();
            }}>Print</button>
        </div>
    </>);
}
