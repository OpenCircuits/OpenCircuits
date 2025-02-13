import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseHeaderPopups} from "shared/state/Header";

import {Popup} from "shared/components/Popup";


export const QuickStartPopup = () => {
    const { curPopup } = useSharedSelector(
        (state) => ({ curPopup: state.header.curPopup })
    );
    const dispatch = useSharedDispatch();

    return (
        <Popup title="Quick Start"
               isOpen={(curPopup === "quick_start")}
               close={() => dispatch(CloseHeaderPopups())}>
            <h2>Basic Interactions</h2>
            <ul>
                <li><b>Placement</b>: Click or drag an item from the ItemNav to place it into the circuit.</li>
                <li><b>Wiring</b>: Click on or drag two ports to wire them together.</li>
                <li><b>Pan</b>: Hold the ALT/OPTION key or Middle Mouse and click to pan the camera.</li>
                <li><b>Translate</b>: Click and drag on an object in the circuit to move it around.</li>
                <li><b>Rotate</b>: Select some objects and click the red circle to rotate them.</li>
                <li><b>Splitting wires</b>: Click and drag on an existing wire to split it at that point.</li>
                <li><b>Multi-select</b>: Hold the SHIFT key and click on items or drag mouse across area to select
                    multiple objects.</li>
                <li><b>Removing wire split</b>: Select wire node(s) and press the X key to snip and remove split.</li>
            </ul>
            <h2>Advanced Interactions</h2>
            <ul>
                <li><b>Snap Objects to Grid</b>: While translating objects, holding down shift will snap the objects to
                    the grid.</li>
                <li><b>Snap Objects to Rotations</b>: While rotating objects, holding down shift will snap the objects
                    to 45&#176; rotations.</li>
                <li><b>Snap Wires</b>: When splitting a wire, you can move the WirePort to positions aligned with the
                    outgoing and incoming ports to snap the wire.</li>
                <li><b>Bus</b>: To bus a group of ports together, simply select an equal number of input/output ports
                    and then press the &apos;Bus&apos; button.</li>
                <li><b>Quick Duplicate Group</b>: To quickly duplicate a group of selected objects, begin Translating
                    them and then press the Spacebar.</li>
                <li><b>Quick Change Gate Input Count</b>: To quickly change the input count of alike gates, select
                    them together and change the input count for all.</li>
            </ul>
        </Popup>
    );
}
