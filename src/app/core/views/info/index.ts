import {AnyObj} from "../../models/types";

import {AnalogComponentInfo, AnalogInfo}   from "./analog";
import {ObjInfoRecord}                     from "./base";
import {DigitalComponentInfo, DigitalInfo} from "./digital";


export const AllComponentInfo = {
    ...DigitalComponentInfo,
    ...AnalogComponentInfo,
};

export const AllInfo: ObjInfoRecord<AnyObj> = {
    ...DigitalInfo,
    ...AnalogInfo,
};
