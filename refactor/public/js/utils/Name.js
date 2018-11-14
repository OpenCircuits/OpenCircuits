// @flow

class Name {
    name: string;
    set: boolean;

    constructor(name: string) {
        this.name = name;
        this.set = false;
    }

    changeName(name: string): void {
        this.name = name;
    }

    setName(name: string): void {
        this.name = name;
        this.set = true;
    }

    getName(): string {
        return this.name;
    }

    isSet(): boolean {
        return this.set;
    }

}

module.exports = Name;
