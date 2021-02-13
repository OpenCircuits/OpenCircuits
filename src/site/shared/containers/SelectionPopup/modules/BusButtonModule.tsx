import {CreateBusAction} from "digital/actions/addition/BusActionFactory";
import {InputPort} from "digital/models/ports/InputPort";
import {OutputPort} from "digital/models/ports/OutputPort";
import {ButtonPopupModule, UseModuleProps} from "./Module";


export const BusButtonModule = (props: UseModuleProps) =>  (
    <ButtonPopupModule
        key="selection-popup-bus-button-module"
        text="Bus"
        alt="Create a bus between selected ports"
        getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
        isActive={(selections) => {
            const iports = selections.filter(s => s instanceof InputPort && s.getWires().length === 0);
            const oports = selections.filter(s => s instanceof OutputPort);
            return iports.length === oports.length &&
                    (iports.length + oports.length) === selections.length;
        }}
        onClick={(selections) => {
            const iports = selections.filter(s => s instanceof InputPort) as InputPort[];
            const oports = selections.filter(s => s instanceof OutputPort) as OutputPort[];
            return CreateBusAction(oports, iports).execute();
        }}
        {...props} />
);
