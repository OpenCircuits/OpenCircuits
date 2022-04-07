import {NetlistAnalysis} from "analog/models/sim/Netlist";
import {CircuitToNetlist} from "analog/models/sim/NetlistGenerator";
import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {useState} from "react";
import {SetHasData, SetSimMappings} from "site/analog/state/Sim";
import {useAnalogDispatch, useAnalogSelector} from "site/analog/utils/hooks/useAnalog";


import "./index.scss";


type Props = {
    info: AnalogCircuitInfo;
}
export const SimButtons = ({ info }: Props) => {
    const dispatch = useAnalogDispatch();
    const { name, hasData, hasMappings } = useAnalogSelector(
        (state) => ({ name: state.circuit.name, ...state.sim })
    );

    const [analysis, setAnalysis] = useState<NetlistAnalysis | undefined>(undefined);

    // TODO:
    // NOTE: Ngspice requires that the following topological constraints are satisfied:
    //   > The circuit cannot contain a loop of voltage sources and/or inductors and cannot
    //      contain a cut-set of current sources and/or capacitors.
    //   > Each node in the circuit must have a dc path to ground.
    //   > Every node must have at least two connections

    return (<>
        {analysis?.kind === "tran" && <div className="sim-analysis-panel">
            <div>Transient Analysis</div>
            {Object.entries(analysis).filter(([key]) => key !== "kind").map(([key, val]) => (
                <div key={`sim-analysis-panel-${key}`}>
                    {key}:
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => setAnalysis({ ...analysis, [key]: e.target.value })} />
                </div>
            ))}
        </div>}
        <div className="sim-buttons">
            <button disabled={!hasMappings} onClick={() => {
                info.sim?.run();
                info.renderer.render();

                dispatch(SetHasData(true));
            }}>Sim</button>

            <button disabled={!analysis} onClick={() => {
                const [netlist, data] = CircuitToNetlist(name, analysis!, info.designer);
                info.sim?.uploadNetlist(netlist);

                dispatch(SetSimMappings(data));
            }}>Upload</button>

            <select value={analysis?.kind ?? ""} onChange={(e) => {
                const val = e.target.value as NetlistAnalysis["kind"];
                switch (val) {
                case "op":
                    setAnalysis({ kind: "op" });
                    return;
                case "tran":
                    setAnalysis({ kind: "tran", tstep: "1ms", tstop: "1s", tstart: "0", tmax: "1ms" })
                }
            }}>
                <option value="" disabled hidden>Type</option>
                <option value="op">DC</option>
                {/* <option value="dc">DC Sweep</option> */}
                <option value="tran">Trans</option>
            </select>

            <button disabled={!hasData} onClick={() => {
                console.log(info.sim?.getPlotIDs());
                const curPlot = info.sim?.getCurPlotID();
                console.log("cur", curPlot);
                const vecs = info.sim?.getVecIDs(curPlot);
                console.log("vecs", vecs);
                const vecIDs = vecs?.map(v => `${curPlot!}.${v}` as const);

                const dataLens = vecIDs?.map(id => info.sim?.getVecLen(id));
                console.log(dataLens);

                const datas = vecIDs?.map((id => info.sim?.getVecData(id)));
                console.log(datas);
                // info.sim?.printData();
            }}>Print</button>
        </div>
    </>);
}