import {WireImpl} from "core/public/api/impl/Wire";

import {DigitalComponent} from "../DigitalComponent";
import {DigitalPort}      from "../DigitalPort";
import {DigitalWire}      from "../DigitalWire";

import {DigitalCircuitState} from "./DigitalCircuitState";


export class DigitalWireImpl extends WireImpl<
    DigitalComponent, DigitalWire, DigitalPort, DigitalCircuitState
> implements DigitalWire {}
