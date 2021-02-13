import {connect} from "react-redux";
import {InputPort} from "digital/models/ports/InputPort";
import {AppState} from "site/state";
import {ButtonPopupModule, UseModuleProps} from "./Module";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {IC} from "digital/models/ioobjects";
import {OpenICViewer} from "site/state/ICViewer/actions";


type OwnProps = UseModuleProps;
type StateProps = {}
type DispatchProps = {
    openViewer: (data: ICData) => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _ViewICButtonModule = (props: Props) => (
    <ButtonPopupModule
        text="View IC"
        alt="View the inside of this IC"
        getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
        isActive={(selections) => {
            return selections.length === 1 && selections[0] instanceof IC;
        }}
        onClick={(selections) => {
            props.openViewer((selections[0]as IC).getData());
        }}
        {...props} />
);


export const ViewICButtonModule = connect<StateProps, DispatchProps, OwnProps, AppState>(
    undefined,
    { openViewer: OpenICViewer },
    undefined,
    { pure: false }
)(_ViewICButtonModule);
