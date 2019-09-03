
export class CircuitMetadata {
    private id: string;
    private name: string;
    private owner: string;
    private desc: string;
    private thumbnail: string;

    public constructor(builder: CircuitMetadataBuilder) {
        this.id = builder.id;
        this.name = builder.name;
        this.owner = builder.owner;
        this.desc = builder.desc;
        this.thumbnail = builder.thumbnail;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getOwner(): string {
        return this.owner;
    }

    public getDesc(): string {
        return this.desc;
    }

    public getThumbnail(): string {
        return this.thumbnail;
    }
}

export class CircuitMetadataBuilder {
    public id: string;
    public name: string;
    public owner: string;
    public desc: string;
    public thumbnail: string;

    public constructor() {
        this.id = "";
        this.name = "";
        this.owner = "";
        this.desc = "";
        this.thumbnail = "";
    }

    public withId(id: string): CircuitMetadataBuilder {
        this.id = id;
        return this;
    }

    public withName(name: string): CircuitMetadataBuilder {
        this.name = name;
        return this;
    }

    public withOwner(owner: string): CircuitMetadataBuilder {
        this.owner = owner;
        return this;
    }

    public withDesc(desc: string): CircuitMetadataBuilder {
        this.desc = desc;
        return this;
    }

    public withThumbnail(thumbnail: string): CircuitMetadataBuilder {
        this.thumbnail = thumbnail;
        return this;
    }

    public build(): CircuitMetadata {
        return new CircuitMetadata(this);
    }

}
