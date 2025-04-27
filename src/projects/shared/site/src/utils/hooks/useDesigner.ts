import {useEffect, useState} from "react";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";


const { setCurDesigner, useCurDesigner } = (() => {
    let curDesigner: CircuitDesigner | undefined;

    const callbacks: Set<(newDesigner: CircuitDesigner) => void> = new Set();
    return {
        setCurDesigner: (designer: CircuitDesigner) => {
            curDesigner = designer;
            callbacks.forEach((c) => c(designer));
        },
        useCurDesigner: () => {
            if (!curDesigner)
                throw new Error("useCurDesigner: No designer set!");

            const [curDesignerState, setCurDesigner] = useState<CircuitDesigner>(curDesigner);
            useEffect(() => {
                callbacks.add(setCurDesigner);
                return () => { callbacks.delete(setCurDesigner); };
            }, [setCurDesigner]);

            return curDesignerState;
        },
    };
})();

export {setCurDesigner, useCurDesigner};
