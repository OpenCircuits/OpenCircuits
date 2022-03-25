// import {useLayoutEffect} from "react";

// import {V} from "Vector";

// import {Input} from "core/utils/Input";

// import {CreateGroupPlaceAction} from "core/actions/addition/PlaceAction";
// import {CreateDeselectAllAction} from "core/actions/selection/SelectAction";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

// import {useWindowSize} from "shared/utils/hooks/useWindowSize";
// import {usePageVisibility} from "shared/utils/hooks/usePageVisibility";
// import {Droppable} from "shared/components/DragDroppable/Droppable";

// import {GetRenderFunc} from "site/digital/utils/Rendering";
// import {useDigitalSelector} from "site/digital/utils/hooks/useDigital";
// import {DigitalCreateN, SmartPlace, SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
}
export const TimeControl = ({ info }: Props) => {

    console.log(info);

    return (
        <div className="container">
            <button type="button" onClick={() => console.log("test")}>meow</button>
            <p>test</p>
        </div>
    );
}
