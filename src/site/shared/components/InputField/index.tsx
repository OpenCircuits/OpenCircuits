import React, {useEffect, useRef} from "react"


type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    onEnter?: (e: KeyboardEvent) => void;
}
export const InputField = React.forwardRef(({onEnter, ...props}: Props, ref: React.RefObject<HTMLInputElement>) => {
    ref = ref ?? useRef<HTMLInputElement>();

    useEffect(() => {
        if (!ref.current)
            throw new Error("InputField.useEffect failed: ref.current is null");
        ref.current.addEventListener("keyup", function (evt) {
            if (evt.key === "Escape" || evt.key === "Enter")
                ref.current!.blur();

            if (evt.key === "Enter" && onEnter)
                onEnter(evt);
        });
    }, [ref]);

    // eslint-disable-next-line react/forbid-elements
    return <input
        {...props}
        ref={ref}
        onChange={(ev) => {
            props.onChange?.(ev);
            // Due to Firefox not focusing when the arrow keys
            //  are pressed on number inputs (issue #818)
            // NOTE: May be fixed with PR #1033
            ref.current?.focus();
        }} />
});
