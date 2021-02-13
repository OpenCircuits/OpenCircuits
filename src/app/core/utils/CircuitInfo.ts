import {HistoryManager} from "core/actions/HistoryManager";
import {CircuitDesigner} from "core/models";
import {Camera} from "math/Camera";
import {Input} from "./Input";
import {Selectable} from "./Selectable";
import {SelectionsWrapper} from "./SelectionsWrapper";


export type CircuitInfo = {
    locked: boolean;

    input: Input;
    camera: Camera;

    history: HistoryManager;

    designer: CircuitDesigner;

    selections: SelectionsWrapper;
    currentlyPressedObject?: Selectable;
}
