import {Action} from "core/actions/Action";

import {Prop} from "core/models/PropInfo";

import {ModuleSubmitInfo} from "./ModuleInputField";


type Props = {
    props: Prop[];

    getText: (states: Prop[]) => string;
    getNewState: (states: Prop[]) => Prop;

    getAction: (newVals: Prop[]) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
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
