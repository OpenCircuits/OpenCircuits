import {Vector} from "Vector";

import {Action} from "core/actions/Action";

import {Component} from "core/models/Component";

import {SnapPos, SnapMidpoint, SnapEdges} from "./SnapUtils";
import { CircuitDesigner } from "core/models";

// Translate can be applied to single components,
//  but if you need to translate multiple components at
//  once you MUST do it as a group to avoid the issue #417
//  https://github.com/OpenCircuits/OpenCircuits/issues/417
export class TranslateAction implements Action {
    protected objs: Component[];
    protected initialPositions: Vector[];
    protected targetPositions: Vector[];
    protected circuit: CircuitDesigner;

    public constructor(objs: Component[], initialPositions: Vector[], targetPositions: Vector[], circuit: CircuitDesigner) {
        this.objs = objs;
        this.initialPositions = initialPositions;
        this.targetPositions = targetPositions;
        this.circuit = circuit;
    }

    public execute(): Action {
        this.objs.forEach((o, i) => o.setPos(this.targetPositions[i]));

        // Always snap afterwards to avoid issue #417
        this.objs.forEach(o => SnapPos(o));

        //Midpoint snap
        this.objs.forEach(o => SnapMidpoint(o, this.circuit.getObjects()))

        //Edge snap
        this.objs.forEach(o => SnapEdges(o, this.circuit.getObjects()))

        return this;
    }

    public undo(): Action {
        this.objs.forEach((o, i) => o.setPos(this.initialPositions[i]));

        // Always snap afterwards to avoid issue #417
        this.objs.forEach(o => SnapPos(o));

        //Midpoint snap
        this.objs.forEach(o => SnapMidpoint(o, this.circuit.getObjects()))

        //Edge snap
        this.objs.forEach(o => SnapEdges(o, this.circuit.getObjects()))

        return this;
    }
}
