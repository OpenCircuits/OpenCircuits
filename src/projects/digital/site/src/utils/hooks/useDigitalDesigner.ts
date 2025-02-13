import {DigitalCircuitDesigner} from "site/digital/utils/DigitalCircuitDesigner";

import {useDesigner, useMainDesigner} from "shared/utils/hooks/useDesigner"


export const useDigitalDesigner = (key: string) =>
    useDesigner(key) as DigitalCircuitDesigner; // Maybe make this safer?

export const useMainDigitalDesigner = () => useMainDesigner() as DigitalCircuitDesigner;
