import React from "react";

import {OVERWRITE_CIRCUIT_MESSAGE} from "shared/site/utils/Constants";

import {useAPIMethods} from "shared/site/utils/ApiMethods";
import {LoadFile}      from "shared/site/utils/Importer";

import {useMainDesigner}   from "shared/site/utils/hooks/useDesigner";
import {useSharedSelector} from "shared/site/utils/hooks/useShared";

import {InputField} from "shared/site/components/InputField";


export const OpenFileButton = () => {
    const designer = useMainDesigner();
    const isSaved = useSharedSelector((state) => state.circuit.isSaved);
    const { LoadCircuit } = useAPIMethods(designer.circuit);

    const fileInput = React.useRef<HTMLInputElement>(null);

    const load = (file: File) => {
        if (isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE))
            LoadCircuit(LoadFile(file, "binary"));
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
