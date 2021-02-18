import React from "react";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {LoadFile} from "shared/utils/Importer";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const OpenFileButton = ({ helpers }: Props) => {
    const fileInput = React.useRef<HTMLInputElement>(null);

    return (
        <div>
            <input type="file" ref={fileInput} multiple={false} accept=".circuit,.json"
                   style={{display: "none"}}
                   onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0)
                            helpers.LoadCircuit(await LoadFile(e.target.files[0]))}
                   } />
            <button type="button" title="Open file" onClick={() => fileInput.current?.click()}>
                <img src="img/icons/open.svg" height="100%" alt="Open a file"/>
            </button>
        </div>
    );
}
