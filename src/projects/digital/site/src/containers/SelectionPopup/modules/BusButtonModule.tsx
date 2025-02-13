import {Circuit} from "core/public";


type Props = {
    circuit: Circuit;
}
// eslint-disable-next-line arrow-body-style
export const BusButtonModule = ({ circuit }: Props) => {
    // @TODO
    // const { renderer, history } = info;

    // const [props, items] = useSelectionProps(
    //     info,
    //     (s): s is (Component | InputPort | OutputPort) => (
    //         (s instanceof Component) ||
    //         (s instanceof InputPort && s.getWires().length === 0) ||
    //         (s instanceof OutputPort && s.getWires().length === 0)
    //     ),
    //     (s) => ({ type: (s instanceof Component ? "component" : "port") })
    // );

    // // No valid selections
    // if (!props)
    //     return null;

    // let iports = items.filter((s) => s instanceof InputPort)  as InputPort[];
    // let oports = items.filter((s) => s instanceof OutputPort) as OutputPort[];
    // const components = items.filter((s) => s instanceof Component) as Component[];

    // // If user has ports AND components selected, then this is an invalid
    // //  state for now, so we will not handle it
    // if ((iports.length > 0 || oports.length > 0) && components.length > 0)
    //     return null;

    // // Gather ports from the components to bus them instead
    // if (components.length > 0)
    //     [iports, oports] = GetComponentBusPorts(components);

    // // Port counts mismatch or no ports selected
    // if (iports.length !== oports.length || iports.length === 0 || oports.length === 0)
    //     return null

    // return (
    //     <button type="button"
    //             title="Create a bus between selected ports"
    //             onClick={() => {
    //                 history.add(Bus(oports, iports));
    //                 renderer.render();
    //             }}>
    //         Bus
    //     </button>
    // );
    return null;
}
