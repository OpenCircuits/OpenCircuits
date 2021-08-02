import {v4} from "uuid";
import {serialize} from "serialeazy";

export class Distinguishable {
    @serialize
    protected guid: string;

    constructor() {
        this.guid = v4();
        console.log("Creating GUID: " + this.guid);
    }

    // If you're calling this explicitly, you're probably doing it wrong
    public setGuid(guid: string): void {
        this.guid = guid;
    }
    public getGuid(): string {
        return this.guid;
    }
}
