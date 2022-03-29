
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
}
export const TimeControl = ({ info }: Props) => {

    return (
        <div className="timecontrol">
            <button type="button" onClick={() => console.log("test")}>
                <img className="singleimg" src="img/items/buf.svg"/>
            </button>
            <button type="button" onClick={() => console.log("test")}>
                <img className="singleimg" src="img/icons/pause.svg"/>
            </button>
            <button type="button" onClick={() => console.log("test")}>
                <img src="img/items/buf.svg"/>
                <img src="img/items/buf.svg"/>
            </button>
        </div>
    );
}
