import {WireImpl} from "shared/api/circuit/public/impl/Wire";

import {DigitalWire}  from "../DigitalWire";
import {DigitalTypes} from "./DigitalCircuitContext";


export class DigitalWireImpl extends WireImpl<DigitalTypes> implements DigitalWire {}
