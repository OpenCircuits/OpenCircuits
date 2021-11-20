import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import "./index.scss";

type Props = {
    isOpen: boolean;
    close: () => void;
}
export const Overlay = ({ isOpen, close }: Props) => {
    const {h} = useWindowSize();

    return (
        <div className={`overlay ${isOpen ? "" : "invisible"}`}
             style={{height: h+"px"}}
             onClick={() => close()}></div>
    );
};