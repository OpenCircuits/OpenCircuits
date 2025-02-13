import {Circuit} from "core/public";


type Props = {
    circuit: Circuit;
}
// eslint-disable-next-line arrow-body-style
export const CreateICButtonModule = ({ circuit }: Props) => {
    // @TODO
    // const dispatch = useDigitalDispatch();

    // const [props, cs] = useSelectionProps(
    //     info,
    //     (s): s is Component => (s instanceof Component),
    //     (s) => ({ name: s.getName() }) // Don't really need any props but
    //                                    //  we need to be able to update the state
    // );

    // if (!(props && ICData.IsValid(cs))) // Make selected components form valid set
    //     return null;

    // return (
    //     <button type="button"
    //             title="Create an IC from selections"
    //             onClick={() => dispatch(OpenICDesigner(ICData.Create(cs)!))}>
    //         Create IC
    //     </button>
    // );
    return null;
}
