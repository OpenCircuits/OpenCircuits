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
        (o) => {
            // If a name is manually set, then use that.
            if (o.name)
                return { name: o.name };
            // Check if the obj is an IC, if so, use the user-set IC name
            const ic = circuit.getIC(o.kind);
            return { name: (ic?.name ?? o.kind) };
        }
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
