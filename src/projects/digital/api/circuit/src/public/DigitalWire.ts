import type {ReadonlyWire, Wire} from "shared/api/circuit/public";

import type {APIToDigital} from "./DigitalCircuit";


interface BaseDigitalWire {}

export type ReadonlyDigitalWire = APIToDigital<ReadonlyWire> & BaseDigitalWire;
export type DigitalWire = APIToDigital<Wire> & BaseDigitalWire;
