import "./index.scss";

type Props = {
    isOpen: boolean;
    close: () => void;
}
export const Overlay = ({ isOpen, close }: Props) => {
    return (
        <div className={`overlay ${isOpen ? "" : "invisible"}`}
             onClick={() => close()}></div>
    );
};