import {Circuit} from "core/public";


type Props = {
    circuit: Circuit;
}
// eslint-disable-next-line arrow-body-style
export const ViewICButtonModule = ({ circuit }: Props) => {
    // @TODO
    // const [props, ics] = useSelectionProps(
    //     info,
    //     (s): s is IC => (s instanceof IC),
    //     (_) => ({ isIC: true }) // Don't really need any props but
    //                             //  we need to be able to update the state
    // );

    // const dispatch = useDigitalDispatch();

    // // Only active when a single IC is selected
    // if (!(props && ics.length === 1))
    //     return null;

    // return (
    //     <button type="button"
    //             title="View the inside of this IC"
    //             onClick={() => dispatch(OpenICViewer(ics[0]))}>
    //         View IC
    //     </button>
    // );
    return null;
}
