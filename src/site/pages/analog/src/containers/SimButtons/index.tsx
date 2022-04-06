import {CircuitToNetlist} from "analog/models/sim/NetlistGenerator";
import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {SetHasData, SetSimMappings} from "site/analog/state/Sim";
import {useAnalogDispatch, useAnalogSelector} from "site/analog/utils/hooks/useAnalog";


import "./index.scss";


type Props = {
    info: AnalogCircuitInfo;
}
export const SimButtons = ({ info }: Props) => {
    const { name, hasData, hasMappings } = useAnalogSelector(
        (state) => ({ name: state.circuit.name, ...state.sim })
    );
    const dispatch = useAnalogDispatch();

    return (
        <div className="sim-buttons">
            <button disabled={!hasMappings} onClick={() => {
                info.sim?.run();

                dispatch(SetHasData(true));
            }}>Sim</button>
            <button onClick={() => {
                const [netlist, data] = CircuitToNetlist(name, info.designer);
                info.sim?.uploadNetlist(netlist);

                dispatch(SetSimMappings(data));
            }}>Upload</button>
            <button disabled={!hasData} onClick={() => {
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
            }}>Print</button>
        </div>
    );
}