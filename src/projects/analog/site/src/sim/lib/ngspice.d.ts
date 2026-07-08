import { NGSpiceLib } from "analog/api/circuit/sim/lib/NGSpiceLib";

export default function NGSpiceFactory(config?: { locateFile?: (path: string) => string }): Promise<NGSpiceLib>;
