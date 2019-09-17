import {XMLNode} from "core/utils/io/xml/XMLNode";
import {XMLable} from "core/utils/io/xml/XMLable";
import {Name} from "core/utils/Name";

import {EECircuitDesigner} from "../EECircuitDesigner";

export abstract class EEObject implements XMLable {
    protected designer?: EECircuitDesigner;
    protected name: Name;

    protected voltage: number;
    protected current: number;
    protected resistance: number;
    protected power: number;

    constructor() {
        this.name = new Name(this.getDisplayName());

        this.voltage = 0;
        this.current = 0;
        this.resistance = 0;
        this.power = 0;
    }

    public setDesigner(designer?: EECircuitDesigner): void {
        this.designer = designer;
    }

    public setName(name: string): void {
        this.name.setName(name);
    }

    public setVoltage(voltage: number): void {
        this.voltage = voltage;
    }

    public setCurrent(current: number): void {
        this.current = current;
    }

    public setResistance(resistance: number): void {
        this.resistance = resistance;
    }

    public setPower(power: number): void {
        this.power = power;
    }

    public getDesigner(): EECircuitDesigner {
        return this.designer;
    }

    public getName(): string {
        return this.name.getName();
    }

    public getVoltage(): number {
        return this.voltage;
    }

    public getCurrent(): number {
        return this.current;
    }

    public getResistance(): number {
        return this.resistance;
    }

    public getPower(): number {
        return this.power;
    }

    public copy(): EEObject {
        let copy: EEObject = new (<any> this.constructor)();
        copy.name = new Name(this.name.getName());
        copy.voltage    = this.voltage;
        copy.current    = this.current;
        copy.resistance = this.resistance;
        return copy;
    }

    public save(node: XMLNode): void {
        node.addAttribute("name", this.name.getName());
        node.addAttribute("voltage",    this.voltage);
        node.addAttribute("current",    this.current);
        node.addAttribute("resistance", this.resistance);
    }
    public load(node: XMLNode): void {
        this.name = new Name(node.getAttribute("name"));
        this.voltage    = node.getFloatAttribute("voltage");
        this.current    = node.getFloatAttribute("current");
        this.resistance = node.getFloatAttribute("resistance");
    }

    public abstract getDisplayName(): string;
    public abstract getXMLName(): string;

}
