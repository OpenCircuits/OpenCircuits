import {connect} from "react-redux";

import {CircuitDesigner, Component} from "core/models";
import {Label} from "digital/models/ioobjects/other/Label";



import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";
import { PlaceAction } from "core/actions/addition/PlaceAction";
import { V } from "Vector";


export const AddLabelButtonModule = (props: UseModuleProps) => (
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
            L.setName((selections[0].getName().length != 0 ? selections[0].getName() : "Label")); 
            //L.getCullBox().setParent((selections[0] as Component).getCullBox());
            L.setPos(V((selections[0] as Component).getPos().x,(selections[0] as Component).getPos().y.valueOf()-(selections[0] as Component).getSize().y));
            return new PlaceAction(props.designer, L).execute();
        }}
        {...props} 
        />
);