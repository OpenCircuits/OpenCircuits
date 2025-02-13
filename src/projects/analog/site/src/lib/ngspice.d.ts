
declare module "*ngspice.wasm" {
    import {NGSpiceLib} from "analog/models/sim/lib/NGSpiceLib";

    export default function(): Promise<NGSpiceLib>;
}
