import {Obj} from "core/public";

import {CircuitDesigner} from "shared/circuitdesigner";

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

    if (!props)
        return null;

    const s = circuit.selections;

    return (<div>
        <label>
            <TextModuleInputField
                circuit={circuit}
                props={props.name}
                placeholder="<Multiple>"
                alt="Name of object(s)"
                doChange={(newNames) =>
                    s.forEach((o, i) => (o.name = newNames[i]))} />
        </label>
    </div>)
}
