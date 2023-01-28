import {Circuit} from "core/public";


type Props = {
    circuit: Circuit;
}
export const OscilloscopeModule = ({ circuit }: Props) =>
    // @TODO
    // const { history, renderer } = info;

    // const [props, cs, forceUpdate] = useSelectionProps(
    //     info,
    //     (o): o is Oscilloscope => (o instanceof Oscilloscope),
    //     (o) => ({
    //         numInputs: o.getInputPortCount().getValue(),
    //     })
    // );

    // const onSubmit = ({ isFinal, action }: ModuleSubmitInfo) => {
    //     renderer.render();
    //     if (isFinal)
    //         history.add(action);
    // }

    // if (!props)
    //     return null;

    // return (<>
    //     <div>
    //         Inputs
    //         <label>
    //             <NumberModuleInputField
    //                 kind="int" min={1} max={8} step={1}
    //                 props={props.numInputs}
    //                 alt="The number of inputs for the Oscilloscope"
    //                 getAction={(newCounts) =>
    //                     new GroupAction(
    //                         cs.map((o,i) => SetInputPortCount(o, newCounts[i])),
    //                         "Oscilloscope Input Count Change Module"
    //                     )}
    //                 onSubmit={onSubmit} />
    //         </label>
    //     </div>
    //     <button type="button"
    //             title="Clear the Oscilloscope readings"
    //             onClick={() => {
    //                 cs.forEach((c) => c.reset());
    //                 renderer.render();
    //                 forceUpdate(); // Need to force an update since this isn't changed by an action
    //             }}>
    //         Clear
    //     </button>
    // </>);
     null

