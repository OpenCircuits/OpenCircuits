import {Vector} from "Vector";

import {AnyComponent, AnyPort} from "core/models/types";

import {PortFactory} from "core/models/types/base/Port";


export type PortPos = { origin: Vector, target: Vector, dir: Vector };

export type PortPosConfig = Record<
    string,   // The port group
    PortPos[] // The list of each port position within the group
>;

export type PortInfo = {
    Default: PortFactory<AnyPort>;
    InitialConfig: number; // Index of Positions

    PositionConfigs: PortPosConfig[];
} & ({
    AllowChanges: false;
    // ChangeGroup?: undefined;
} | {
    AllowChanges: true;

    // The group that should dictate the changes
    //  i.e. Input count, Select count, Output count
    ChangeGroup: string;
})

export type PortInfoRecord<C extends AnyComponent> = Record<C["kind"], PortInfo>;
