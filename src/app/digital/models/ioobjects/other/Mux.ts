import {serialize} from "serialeazy";

import {DEFAULT_SIZE, MULTIPLEXER_HEIGHT_OFFSET, MUX_DEFAULT_SELECT_PORTS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Component, Port} from "core/models";

import {PortSet} from "core/models/ports/PortSets";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {DigitalComponent, DigitalWire} from "digital/models";

import {InputPort}  from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";


export abstract class Mux extends DigitalComponent {
    @serialize
    protected selects: PortSet<InputPort>;

    public constructor(inputPortCount: ClampedValue, outputPortCount: ClampedValue,
                        selectPositioner: Positioner<InputPort>,
                        inputPositioner?: Positioner<InputPort>,
                        outputPositioner?: Positioner<OutputPort>) {
        super(inputPortCount, outputPortCount, V(), inputPositioner, outputPositioner);

        this.selects = new PortSet<InputPort>(
            this, new ClampedValue(MUX_DEFAULT_SELECT_PORTS, 1, 8),
            selectPositioner, InputPort as new (c: Component) => InputPort
        );

        this.setSelectPortCount(MUX_DEFAULT_SELECT_PORTS);
    }

    protected updatePortNames(): void {
        this.selects.getPorts().forEach((p, i) => {
            if (p.getName() === "")
                p.setName(`S${i}`);
        });
    }

    public setSelectPortCount(val: number): void {
        // Update size (before setting ports since their positions are based on the size)
        const newSize = V((0.5 + val/2), (1 + Math.pow(2, val - 1))).scale(DEFAULT_SIZE);
        this.setSize(newSize);

        this.selects.setPortCount(val);

        // Update input port positions and port names
        this.inputs.updatePortPositions();
        this.outputs.updatePortPositions();
        this.updatePortNames();
    }

    public getSelectPorts(): InputPort[] {
        return this.selects.getPorts();
    }

    public getSelectPortCount(): ClampedValue {
        return this.selects.getCount();
    }

    public numSelects(): number {
        return this.selects.length;
    }

    // @Override
    public getOffset(): Vector {
        return super.getOffset().add(0, MULTIPLEXER_HEIGHT_OFFSET/2);
    }

    // @Override
    public getInputs(): DigitalWire[] {
        // Get each wire connected to each InputPort
        //  and then filter out the null ones
        return [
            ...super.getInputs(),
            ...this.getSelectPorts()
                .map((p) => p.getInput())
                .filter((w) => !!w),
        ];
    }

    // @Override
    public getPorts(): Port[] {
        return [...super.getPorts(), ...this.getSelectPorts()];
    }
}
