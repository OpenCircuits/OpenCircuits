import {WireImpl} from "shared/api/circuit/public/impl/Wire";

import {DigitalWire}  from "../DigitalWire";
import {DigitalAPITypes} from "./DigitalCircuitContext";


export class DigitalWireImpl extends WireImpl<DigitalAPITypes> implements DigitalWire {}
