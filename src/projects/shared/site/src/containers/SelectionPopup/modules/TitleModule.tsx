import {useCallback} from "react";

import {Obj} from "shared/api/circuit/public";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {TextModuleInputField} from "./inputs/TextModuleInputField";
import {useSelectionProps}    from "./useSelectionProps";


type Props = {
    designer: CircuitDesigner;
}
export const TitleModule = ({ designer }: Props) => {
    const circuit = designer.circuit;

    const [props] = useSelectionProps(
        circuit,
        (o): o is Obj => true,
        (o) => ({ name: (o.name ?? o.kind) })
    );

    const s = circuit.selections;
    const doChange = useCallback((newNames: string[]) =>
        s.forEach((o, i) => (o.name = newNames[i]))
    , [s]);

    if (!props)
        return null;

    return (<div>
        <label>
            <TextModuleInputField
                circuit={circuit}
                props={props.name}
                placeholder="<Multiple>"
                alt="Name of object(s)"
                doChange={doChange} />
        </label>
    </div>)
}
