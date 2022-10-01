import {AnyComponent} from "core/models/types";

import {AnalogPortInfo}  from "./analog";
import {DigitalPortInfo} from "./digital";
import {PortInfoRecord}  from "./types";


export const AllPortInfo: PortInfoRecord<AnyComponent> = {
    ...DigitalPortInfo,
    ...AnalogPortInfo,
};
