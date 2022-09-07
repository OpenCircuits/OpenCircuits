import {serializable} from "serialeazy";

import {SAVE_VERSION} from "core/utils/Constants";


@serializable("CircuitMetadataDef")
export class CircuitMetadataDef {
    public id: string;
    public name: string;
    public owner: string;
    public desc: string;
    public thumbnail: string;
    public version: string;
}

@serializable("CircuitMetadata")
export class CircuitMetadata {
    private readonly data: CircuitMetadataDef;

    public constructor(data?: CircuitMetadataDef) {
        this.data = data!;
    }

    public getId(): string {
        return this.data.id;
    }

    public getName(): string {
        return this.data.name;
    }

    public getOwner(): string {
        return this.data.owner;
    }

    public getDesc(): string {
        return this.data.desc;
    }

    public getThumbnail(): string {
        return this.data.thumbnail;
    }

    public getVersion(): string {
        return this.data.version;
    }

    public getDef(): CircuitMetadataDef {
        return this.data;
    }

    public static Default(): CircuitMetadata {
        return new CircuitMetadataBuilder().build();
    }

    public buildOn(): CircuitMetadataBuilder {
        return new CircuitMetadataBuilder()
                .withId(this.data.id)
                .withName(this.data.name)
                .withOwner(this.data.owner)
                .withDesc(this.data.desc)
                .withThumbnail(this.data.thumbnail)
                .withVersion(this.data.version);
    }
}

export class CircuitMetadataBuilder {
    private data: CircuitMetadataDef;

    public constructor() {
        this.data = new CircuitMetadataDef();
        this.data.id = "";
        this.data.name = "Untitled Circuit";
        this.data.owner = "";
        this.data.desc = "";
        this.data.thumbnail = "";
        this.data.version = SAVE_VERSION;
    }

    public withId(id: string): CircuitMetadataBuilder {
        this.data.id = id;
        return this;
    }

    public withName(name: string): CircuitMetadataBuilder {
        this.data.name = name;
        return this;
    }

    public withOwner(owner: string): CircuitMetadataBuilder {
        this.data.owner = owner;
        return this;
    }

    public withDesc(desc: string): CircuitMetadataBuilder {
        this.data.desc = desc;
        return this;
    }

    public withThumbnail(thumbnail: string): CircuitMetadataBuilder {
        this.data.thumbnail = thumbnail;
        return this;
    }

    public withVersion(version: string): CircuitMetadataBuilder {
        this.data.version = version;
        return this;
    }

    public build(): CircuitMetadata {
        return new CircuitMetadata(this.data);
    }

}
