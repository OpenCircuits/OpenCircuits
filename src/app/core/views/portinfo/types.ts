import {Vector} from "Vector";

import {GUID} from "core/utils/GUID";

import {AnyComponent, AnyPort} from "core/models/types";


export type PortPos = { origin: Vector, target: Vector, dir: Vector };

// Comma separated string like "1,2" which represents
//  1 port at group 0 and 2 ports at group 1.
//  In digital this would mean 1 input port and 2 output ports
// Something like "1,,2" would mean 1 port at group 0, 0 ports at group 1,
//  and 2 ports at group 2. In digital this would mean 1 input port and 2 select ports.
export type PortConfig = string; // `${number|},${number|},${number|}` could be a candidate replacement

// Represents a unique port with respect to its parent in form of it's group:index
//  So "0:0" represents a port at group 0, index 0. In digital this means the first
//  input port. "1:0" would then represent the first output port.
export type PortIndex = `${number}:${number}`;

export type PortInfo = {
    Default: (id: GUID, parent: GUID, group: number, index: number) => AnyPort;
    InitialConfig: string;

    Positions: Record<
        PortConfig,
        Record<PortIndex, PortPos>
    >;
} & ({
    AllowChanges: false;
    // ChangeGroup?: undefined;
} | {
    AllowChanges: true;

    // The group that should dictate the changes
    //  i.e. Input count, Select count, Output count
    ChangeGroup: number;
})

export type PortInfoRecord<C extends AnyComponent> = Record<C["kind"], PortInfo>;
