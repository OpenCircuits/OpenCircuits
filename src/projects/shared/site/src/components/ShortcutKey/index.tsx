import "./index.scss";


type Props = {
    readonly children: React.ReactNode;
}
export const ShortcutKey = ({ children }: Props) => (
    <span className="shortcut_key">{children}</span>
);
