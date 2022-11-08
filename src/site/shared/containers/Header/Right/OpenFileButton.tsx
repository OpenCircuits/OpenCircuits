import React from "react";

import {OVERWRITE_CIRCUIT_MESSAGE} from "shared/utils/Constants";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {LoadFile}           from "shared/utils/Importer";

import {useSharedSelector} from "shared/utils/hooks/useShared";

import {InputField} from "shared/components/InputField";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const OpenFileButton = ({ helpers }: Props) => {
    const isSaved = useSharedSelector((state) => state.circuit.isSaved);

    const fileInput = React.useRef<HTMLInputElement>(null);

    const load = (file: File) => {
        if (isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE))
            helpers.LoadCircuit(() => LoadFile(file));
    }

    return (<>
        <InputField ref={fileInput} type="file" multiple={false} accept=".circuit,.json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0)
                            load(e.target.files![0]);
                    }} />
        <button type="button" title="Open file" onClick={() => fileInput.current?.click()}>
            <img src="img/icons/open.svg" width="34px" height="34px" alt="Open a file" />
        </button>
    </>);
}
