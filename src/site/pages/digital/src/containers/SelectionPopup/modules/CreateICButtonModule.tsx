import {Component} from "core/models";

import {ICData} from "digital/models/ioobjects/other/ICData";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";
import {OpenICDesigner} from "site/digital/state/ICDesigner";


export const CreateICButtonModule = (props: UseModuleProps) => {
    const dispatch = useDigitalDispatch();

    return (
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
                const data = ICData.Create(selections as Component[])!;
                dispatch(OpenICDesigner(data));
            }}
            {...props} />
    );
}
