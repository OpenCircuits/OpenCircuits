import type {ReadonlyWire, Wire} from "shared/api/circuit/public";

import type {APIToDigital} from "./DigitalCircuit";


export interface ReadonlyDigitalWire extends APIToDigital<ReadonlyWire> {}
type W = APIToDigital<Wire> & ReadonlyDigitalWire;
export interface DigitalWire extends W {}
