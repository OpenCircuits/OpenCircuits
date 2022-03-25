
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
}
export const TimeControl = ({ info }: Props) => {

    console.log(info);

    return (
        <div className="container">
            <button title="step" onClick={() => console.log("test")}>meow</button>
            <button title="step2" onClick={() => console.log("test")}>meow</button>
            <button title="step3" onClick={() => console.log("test")}>meow</button>
        </div>
    );
}
