// @flow

var Name = require("../../utils/Name");
var CircuitDesigner = require("../CircuitDesigner");

class IOObject {
    designer: CircuitDesigner;
    name: Name;

    constructor() {
        this.name = new Name(this.getDisplayName());
    }

    activate(signal: boolean, i: number = 0): void {
    }

	setDesigner(designer: CircuitDesigner): void {
		this.designer = designer;
	}

	getDesigner(): CircuitDesigner {
		return this.designer;
	}

    getDisplayName(): string {
        return "IOObject";
    }
}

module.exports = IOObject;
