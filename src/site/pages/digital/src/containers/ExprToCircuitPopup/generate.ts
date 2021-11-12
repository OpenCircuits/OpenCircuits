import {Create} from "serialeazy";

import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";
import {PlaceAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, SelectAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

import {CreateICDataAction} from "digital/actions/CreateICDataAction";
import {CreateNegatedGatesAction} from "digital/actions/simplification/NegatedGatesActionFactory";

import {DigitalComponent} from "digital/models";
import {LED, ICData, IC} from "digital/models/ioobjects";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";
import {GenerateTokens} from "digital/utils/ExpressionParser/GenerateTokens";
import {OperatorFormat} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";


export function Generate(info: DigitalCircuitInfo, expression: string,
                         isIC: boolean, input: string, format: string,
                         ops: OperatorFormat) {
    // Set the operator format
    if (format !== "custom")
        ops = Formats.find(form => form.icon === format);

    // Create input tokens
    const tokenList = GenerateTokens(expression, ops);
    const inputMap = new Map<string, DigitalComponent>();
    for (const token of tokenList) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, Create<DigitalComponent>(input));
        inputMap.get(token.name).setName(token.name);
    }

    // Create output LED
    const o = new LED();
    o.setName("Output");

    // Get the generated circuit
    const circuit = ExpressionToCircuit(inputMap, expression, o, ops);

    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    const action = new GroupAction([CreateDeselectAllAction(info.selections).execute(),
                                    CreateAddGroupAction(info.designer, circuit).execute()]);
    const [negateAction, negated] = CreateNegatedGatesAction(info.designer, circuit);
    action.add(negateAction);
    OrganizeMinDepth(negated, startPos);

    if (isIC) { // If creating as IC
        const data = ICData.Create(negated);
        data.setName(expression);
        const ic = new IC(data);
        ic.setName(expression);
        ic.setPos(info.camera.getPos());
        action.add(CreateDeleteGroupAction(info.designer, negated.getComponents()).execute());
        action.add(new CreateICDataAction(data, info.designer).execute());
        action.add(new PlaceAction(info.designer, ic).execute());
        action.add(new SelectAction(info.selections, ic).execute());
    } else { // If placing directly
        action.add(CreateGroupSelectAction(info.selections, negated.getComponents()).execute());
    }

    info.history.add(action);
    info.renderer.render();
}

