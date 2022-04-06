import {CircuitToNetlist} from "analog/models/sim/NetlistGenerator";
import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {useAnalogSelector} from "site/analog/utils/hooks/useAnalog";


import "./index.scss";


type Props = {
    info: AnalogCircuitInfo;
}
export const SimButtons = ({ info }: Props) => {
    const { name } = useAnalogSelector(
        (state) => ({ name: state.circuit.name })
    );

    return (
        <div className="sim-buttons">
            <span onClick={() => {
                info.sim?.run();
            }}>Sim</span>
            <span onClick={() => {
                const netlist = CircuitToNetlist(name, info.designer);
                info.sim?.uploadNetlist(netlist);
            }}>Upload</span>
            <span onClick={() => {
                console.log(info.sim?.getPlotIDs());
                const curPlot = info.sim?.getCurPlotID();
                console.log("cur", curPlot);
                const vecs = info.sim?.getVecIDs(curPlot);
                console.log("vecs", vecs);
                const vecIDs = vecs?.map(v => `${curPlot}.${v}`);

                const dataLens = vecIDs?.map(id => info.sim?.getVecLen(id));
                console.log(dataLens);

                const datas = vecIDs?.map((id => info.sim?.getVecData(id)));
                console.log(datas);
                // info.sim?.printData();
            }}>Print</span>
        </div>
    );
}