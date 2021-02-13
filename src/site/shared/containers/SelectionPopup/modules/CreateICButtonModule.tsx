import {connect} from "react-redux";

import {Component} from "core/models";
import {ICData} from "digital/models/ioobjects/other/ICData";

import {AppState} from "site/state";
import {OpenICDesigner} from "site/state/ICDesigner/actions";

import {ButtonPopupModule, UseModuleProps} from "./Module";


type OwnProps = UseModuleProps
type StateProps = {}
type DispatchProps = {
    openDesigner: (data: ICData) => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _CreateICButtonModule = (props: Props) => (
    <ButtonPopupModule
        text="Create IC"
        alt="Create an IC from selections"
        getDependencies={(_) => ""}
        isActive={(selections) => {
            if (!selections.every(s => s instanceof Component))
                return false;
            return ICData.IsValid(selections as Component[]);
        }}
        onClick={(selections) => {
            const data = ICData.Create(selections as Component[]);
            props.openDesigner(data);
        }}
        {...props} />
);


export const CreateICButtonModule = connect<StateProps, DispatchProps, OwnProps, AppState>(
    undefined,
    { openDesigner: OpenICDesigner },
    undefined,
    { pure: false }
)(_CreateICButtonModule);
