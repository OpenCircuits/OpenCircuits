import {DigitalComponent} from "digital/api/circuit/public";
import {Circuit} from "shared/api/circuit/public";
import {SelectModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/SelectModuleInputField";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


const swappableComponents = [
    {
        "Button": "Button",
        "Switch": "Switch",
        "ConstantLow": "Constant Low",
        "ConstantHigh": "Constant High",
        "Clock": "Clock",
    },
    {
        "BUFGate": "Buffer",
        "NOTGate": "NOT Gate",
    },
    {
        "ANDGate": "AND Gate",
        "NANDGate": "NAND Gate",
        "ORGate": "OR Gate",
        "NORGate": "NOR Gate",
        "XORGate": "XOR Gate",
        "XNORGate": "XNOR Gate",
    },
] as const;

type Props = {
    circuit: Circuit;
}
export const ReplaceComponentDropdownModule = ({ circuit }: Props) => {
    const [props] = useSelectionProps(
        circuit,
        (c): c is DigitalComponent => (c.baseKind === "Component"),
        (c) => ({ kind: c.kind, id: c.id }),
    );

    // Show if only one component is selected
    if (!props || props.kind.length !== 1)
        return;

    const [kind] = props.kind;
    const swapGroup = swappableComponents.find((group) => kind in group);
    if (!swapGroup)
        return;

    const comp = circuit.getComponent(props.id[0])!;
    const options = Object.entries(swapGroup).map(([kind, display]) => [display, kind] as const);

    return (<div>
        Replace Component
        <label>
            <SelectModuleInputField
                kind="string[]"
                circuit={circuit}
                options={options}
                props={[kind]}
                doChange={([selection]) => {
                    comp.replaceWith(selection);
                }} />
        </label>
    </div>);
}
