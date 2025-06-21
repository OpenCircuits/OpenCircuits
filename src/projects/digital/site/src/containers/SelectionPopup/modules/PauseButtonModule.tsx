import {DigitalCircuit, DigitalComponent} from "digital/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: DigitalCircuit;
}
// eslint-disable-next-line arrow-body-style
export const PauseButtonModule = ({ circuit }: Props) => {
    const [props, cs] = useSelectionProps(
        circuit,
        (c): c is DigitalComponent => (c.baseKind === "Component" && (c.kind === "Clock" || c.kind === "Oscilloscope")),
        (c) => ({ id: c.id, isPaused: c.getProp("paused") ?? false }),
    );

    // Show if valid and if there are multiple clocks
    if (!props || cs.length === 0)
        return null;

    // If everything is paused, then we want the button to be a "Resume" button
    // Otherwise, it will be "Pause" and pause all the components.
    const isPaused = (props.isPaused.every(Boolean));

    const onClick = () => {
        console.log(isPaused)
        cs.forEach((c) =>
            c.setProp("paused", !isPaused));
    };

    if (isPaused) {
        return (
            <button type="button"
                    title="Resume the selected components"
                    onClick={onClick}>
                Resume
            </button>
        );
    }

    return (
        <button type="button"
                title="Pause the selected components"
                onClick={onClick}>
            Pause
        </button>
    );
}
