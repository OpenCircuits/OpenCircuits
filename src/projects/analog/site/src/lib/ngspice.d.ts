
declare module "*ngspice.wasm" {
    import {NGSpiceLib} from "./NGSpiceLib";

    export default function(): Promise<NGSpiceLib>;
}
