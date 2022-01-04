import {CircuitDesigner, Component, Port} from "core/models";
import {Action} from "./Action";
import {DisconnectAction, ConnectionAction} from "./addition/ConnectionAction";
import {PlaceAction, DeleteAction} from "./addition/PlaceAction";
import {GroupAction} from "./GroupAction";
import {TranslateAction} from "./transform/TranslateAction";


/**
 * Returns a GroupAction for replacing the original component with a new one. Both must have the same number of ports.
 * original must be placed in designer, and replacement must not be placed in designer. This action implicitly executes on creation.
 * 
 * @param designer the designer that original is placed on
 * @param original the component to replace, already in designer
 * @param replacement the new component, not yet in designer
 * @return a GroupAction containing the actions required to replace the component
 * @throws {Error} if original and replacement do not have the same number of ports
 */
 export function CreateReplaceComponentAction(designer: CircuitDesigner, original: Component, replacement: Component): GroupAction {
    const action = new GroupAction();
    const originalPorts = original.getPorts();
    const replacementPorts = replacement.getPorts();

    if (originalPorts.length !== replacementPorts.length)
        throw new Error("Mismatched number of ports of replacement");

    action.add(new PlaceAction(designer, replacement).execute());
    
    originalPorts.forEach((port, index) => {
        port.getWires().forEach(wire => {
            const otherPort = (wire.getP1() === port) ? wire.getP2() : wire.getP1();
            action.add(new DisconnectAction(designer, wire).execute());
            action.add(new ConnectionAction(designer, replacementPorts[index], otherPort).execute());
        });
    });
        
    action.add(new TranslateAction([replacement], [replacement.getPos()], [original.getPos()]).execute());
    action.add(new DeleteAction(designer, original).execute());

    return action;
}