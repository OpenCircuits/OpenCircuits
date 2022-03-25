
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
}
export const TimeControl = ({ info }: Props) => {

    return (
        <div className="timecontrol">
            <button onClick={() => console.log("test")}>meow</button>
            <button onClick={() => console.log("test")}>meow</button>
            <button onClick={() => console.log("test")}>meow</button>
        </div>
    );
}
