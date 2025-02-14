import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";


const { storeDesigner, useDesigner, useMainDesigner } = (() => {
    const storedDesigners = new Map<string, CircuitDesigner>();

    return {
        storeDesigner: (key: string, designer: CircuitDesigner) => {
            storedDesigners.set(key, designer);
        },
        useDesigner:     (key: string) => storedDesigners.get(key),
        useMainDesigner: () => {
            const designer = storedDesigners.get("main");
            if (!designer)
                throw new Error("useMainDesigner: Failed to find a circuit designer labeled as 'main'!");
            return designer;
        },
    };
})();

export {storeDesigner, useDesigner, useMainDesigner};
