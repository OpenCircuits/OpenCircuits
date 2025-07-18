import {useState} from "react";

import {AnalogCircuit, AnalysisInfo} from "analog/api/circuit/public";

import {InputField} from "shared/site/components/InputField";

import "./index.scss";


type Props = {
    circuit: AnalogCircuit;
}
export const SimButtons = ({ circuit }: Props) => {
    const [analysis, setAnalysis] = useState<AnalysisInfo>({
        kind: "tran", tstep: "1ms", tstop: "0.45s", tstart: "0", tmax: "0ms",
    });

    const Simulate = () => {
        // eslint-disable-next-line react-compiler/react-compiler
        circuit.sim.analysis = analysis;
        circuit.sim.run();
    };


    // TODO:
    // NOTE: Ngspice requires that the following topological constraints are satisfied:
    //   > The circuit cannot contain a loop of voltage sources and/or inductors and cannot
    //      contain a cut-set of current sources and/or capacitors.
    //   > Each node in the circuit must have a dc path to ground.
    //   > Every node must have at least two connections

    return (<>
        {analysis.kind === "tran" && (
            <div className="sim-analysis-panel">
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
            <button type="button" onClick={Simulate}>Sim</button>

            <select value={analysis?.kind ?? ""} onChange={(e) => {
                const val = e.target.value as AnalysisInfo["kind"];
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

            <button type="button" onClick={() => {
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
