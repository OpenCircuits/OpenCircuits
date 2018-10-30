// @flow

var CircuitDesigner = require("../CircuitDesigner");

class IOObject {
    designer: CircuitDesigner;
    
    constructor() {
    }
    
    activate(signal: boolean, i: number = 0): void {
    }
    
	setDesigner(designer: CircuitDesigner): void {
		this.designer = designer;
	}

	getDesigner(): CircuitDesigner {
		return this.designer;
	}
    
}

module.exports = IOObject;