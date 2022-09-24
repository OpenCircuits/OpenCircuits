import {AnalogComponentInfo, AnalogInfo}   from "./analog";
import {DigitalComponentInfo, DigitalInfo} from "./digital";


export const AllComponentInfo = {
    ...DigitalComponentInfo,
    ...AnalogComponentInfo,
};

export const AllInfo = {
    ...DigitalInfo,
    ...AnalogInfo,
};
