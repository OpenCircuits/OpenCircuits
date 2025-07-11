import {MainDesigner} from "shared/site/containers/MainDesigner";

import {DigitalCircuit} from "digital/api/circuit/public";

import {SmartPlace, SmartPlaceOptions} from "digital/site/utils/SmartPlace";

import "./index.scss";


export const DigitalMainDesigner = ({ circuit }: {circuit: DigitalCircuit}) => (
    <MainDesigner
        otherPlace={(pos, itemKind, num, smartPlaceOptions) => {
            const smartPlaceOption = Array.isArray(smartPlaceOptions) ? smartPlaceOptions.at(0) : undefined;
            if (smartPlaceOption === SmartPlaceOptions.Full ||
                smartPlaceOption === SmartPlaceOptions.Inputs ||
                smartPlaceOption === SmartPlaceOptions.Outputs) {
                SmartPlace(pos, itemKind, circuit, num, smartPlaceOption);
                return true;
            }
            return false;
        }} />
);
