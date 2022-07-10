import {CircuitInfo} from "core/utils/CircuitInfo";

import {Component} from "core/models";

import {ICData} from "digital/models/ioobjects/other/ICData";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";

import {OpenICDesigner} from "site/digital/state/ICDesigner";


type Props = {
    info: CircuitInfo;
}
export const CreateICButtonModule = ({ info }: Props) => {
    const dispatch = useDigitalDispatch();

    const [props, cs] = useSelectionProps(
        info,
        (s): s is Component => (s instanceof Component),
        (s) => ({ name: s.getName() }) // Don't really need any props but
                                       //  we need to be able to update the state
    );

    if (!(props && ICData.IsValid(cs))) // Make selected components form valid set
        return null;

    return (
        <button type="button"
                title="Create an IC from selections"
                onClick={() => dispatch(OpenICDesigner(ICData.Create(cs)!))}>
            Create IC
        </button>
    );
}
