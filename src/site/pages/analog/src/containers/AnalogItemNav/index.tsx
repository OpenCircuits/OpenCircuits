import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {ItemNav} from "shared/containers/ItemNav";

import itemNavConfig from "site/analog/data/itemNavConfig.json";


type Props = {
    info: AnalogCircuitInfo;
}
export const AnalogItemNav = ({ info }: Props) => (
    <ItemNav info={info} config={itemNavConfig} />
);
