import {CircuitDesigner, Component, Port} from "core/models";
import {Action} from "./Action";
import {DisconnectAction, ConnectionAction} from "./addition/ConnectionAction";
import {PlaceAction, DeleteAction} from "./addition/PlaceAction";
import {GroupAction} from "./GroupAction";
import {TranslateAction} from "./transform/TranslateAction";


/**
 * This action is used to replace a component with a new one.
 */
 export class ReplaceComponentAction implements Action {
    private designer: CircuitDesigner;
    private original: Component;
    private replacement: Component;
    private action: GroupAction;
    private originalPorts: Port[];
    private replacementPorts: Port[];

    /**
     * Action for replacing the original component with a new one. Both must have the same number of ports.
     * original must be placed in designer, and replacement must not be placed in designer.
     * 
     * @param designer the designer that original is placed on
     * @param original the component to replace, already in designer
     * @param replacement the new component, not yet in designer
     * @throws {Error} if original and replacement do not have the same number of ports
     */
    public constructor(designer: CircuitDesigner, original: Component, replacement: Component) {
        this.designer = designer;
        this.original = original;
        this.replacement = replacement;
        this.action = new GroupAction();
        
        this.originalPorts = this.original.getPorts();
        this.replacementPorts = this.replacement.getPorts();

        // An even more general replacer may need to modify this for an instance such as replacing
        //  and ANDGate only connected by its output port with a Switch
        if (this.originalPorts.length !== this.replacementPorts.length)
            throw new Error("Mismatched number of ports of replacement");
    }

    public execute(): Action {
        if (this.action.isEmpty()) {
            this.action.add(new PlaceAction(this.designer, this.replacement).execute());
    
            this.originalPorts.forEach((port, index) => {
                port.getWires().forEach(wire => {
                    const otherPort = (wire.getP1() === port) ? wire.getP2() : wire.getP1();
                    this.action.add(new DisconnectAction(this.designer, wire).execute());
                    this.action.add(new ConnectionAction(this.designer, this.replacementPorts[index], otherPort).execute());
                });
            });
        
            this.action.add(new TranslateAction([this.replacement], [this.replacement.getPos()], [this.original.getPos()]).execute());
            this.action.add(new DeleteAction(this.designer, this.original).execute());
        } else {
            this.action.execute();
        }

        return this;
    }

    public undo(): Action {
        this.action.undo();

        return this;
    }
}