import {Action} from "shared/api/circuit/actions/Action";

import {Prop} from "shared/api/circuit/models/PropInfo";

import {ModuleSubmitInfo} from "./ModuleInputField";


type Props = {
    readonly props: Prop[];

    readonly getText: (states: Prop[]) => string;
    readonly getNewState: (states: Prop[]) => Prop;

    readonly getAction: (newVals: Prop[]) => Action;
    readonly onSubmit: (info: ModuleSubmitInfo) => void;
}
export const ButtonModuleInputField = ({ props, getText, getNewState, getAction, onSubmit }: Props) => {
    const text = getText(props);

    const onClick = () => {
        const newState = getNewState(props);
        onSubmit({
            isFinal: true,
            action:  getAction(props.map((_) => newState)),
        });
    }

    return (
        <button type="button"
                title="Toggle the button"
                onClick={onClick}>
            {text}
        </button>
    );
}
