import "./index.scss";

type Props = {
    isOpen: boolean;
    close: () => void;
    children?: React.ReactNode;
}
export const Overlay = ({ isOpen, close, children }: Props) => (
    <div className={`overlay ${isOpen ? "" : "invisible"}`}
         onClick={() => close()}>
        {children}
    </div>
);