import {Header} from "shared/containers/Header";
import {Dropdown} from "shared/containers/Header/Right/Dropdown";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

// type Tool = {
//     popupName: string[];
//     img: string[];
// }
type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
}
// function test(): Tool[] {
//     const exprToCircuit = new Tool;
//     const extraTools = [];
//     <div onClick={() => { closeMenus(); openPopup("expr_to_circuit"); }}>
//             <img src="img/icons/bool_expr_input_icon.svg" height="100%" alt="" />
//             <span>Boolean Expression to Circuit</span>
//         </div>
//     return null;
// }
export const DigitalHeader = ({ img, helpers }: Props) => (
    <Header img={img} helpers={helpers} extraToolsPopupNames={["expr_to_circuit"]} extraToolsimgNames={["img/icons/bool_expr_input_icon.svg"]} />
);
