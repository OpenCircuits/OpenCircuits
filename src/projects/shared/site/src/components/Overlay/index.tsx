import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import "./index.scss";


type Props = {
    readonly isOpen: boolean;
    readonly close: () => void;
    readonly children?: React.ReactNode;
}
export const Overlay = ({ isOpen, close, children }: Props) => {
    // Needed because Safari sucks: https://medium.com/rbi-tech/safaris-100vh-problem-3412e6f13716
    const { h } = useWindowSize();

    return (
        <div className={`overlay ${isOpen ? "" : "invisible"}`}
             role="document"
             style={{ height: h+"px" }}
             onClick={() => close()}>
            {children}
        </div>
    );
};
