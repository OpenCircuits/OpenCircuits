import {connect} from "react-redux";

import {CircuitDesigner, Component} from "core/models";
import {Label} from "digital/models/ioobjects/other/Label";

import {AppState} from "site/digital/state";


import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";
import { PlaceAction } from "core/actions/addition/PlaceAction";
import { V } from "Vector";


const _AddLabelButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Add Label"
        alt="Add a label that will stick to the component"
        getDependencies={(_) => ""}
        isActive={(selections) => {
            if (!selections.every(s => s instanceof Component))
                return false;
            return selections.length == 1;
        }}
        onClick={(selections) => {
            console.log(props.designer);
            const L = new Label();
            L.getTransform().setParent((selections[0] as Component).getTransform());
            L.setPos(V(0,50));
            return new PlaceAction(props.designer, L).execute();
        }}
        {...props} 
        />
);


export const AddLabelButtonModule = connect<UseModuleProps>(
    undefined,
    { },
    undefined,
    { pure: false }
)(_AddLabelButtonModule);
