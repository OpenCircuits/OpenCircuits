import React, {useEffect, useRef} from "react";

import "./index.scss";


type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    onEnter?: (e: KeyboardEvent) => void;
}
export const InputField = React.forwardRef<HTMLInputElement, Props>(({ onEnter, ...props }, forwardedRef) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const ref = (forwardedRef ?? defaultRef) as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        const cur = ref.current;
        if (!cur)
            throw new Error("InputField.useEffect failed: ref.current is null");

        const onKeyUp = (evt: KeyboardEvent) => {
            if (evt.key === "Escape" || evt.key === "Enter")
                cur.blur();

            if (evt.key === "Enter")
                onEnter?.(evt);
        }

        cur.addEventListener("keyup", onKeyUp);
        return () => cur.removeEventListener("keyup", onKeyUp);
    }, [ref, onEnter]);

    return (
        // eslint-disable-next-line react/forbid-elements
        <input
            {...props}
            ref={ref}
            onChange={(ev) => {
                props.onChange?.(ev);
                // // Due to Firefox not focusing when the arrow keys
                // //  are pressed on number inputs (issue #818)
                // // NOTE: May be fixed with PR #1033
                // ref.current?.focus();
            }} />
    );
}) as React.FC<Props> & { ref?: React.RefObject<HTMLInputElement> };
InputField.displayName = "InputField";


type NumberProps = Props & {
    step?: number;

    onIncrement?: (step: number) => void;
}
export const NumberInputField = React.forwardRef<HTMLInputElement, NumberProps>(({ onIncrement, step, ...props },
                                                                                   forwardedRef) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const ref = (forwardedRef ?? defaultRef) as React.MutableRefObject<HTMLInputElement>;

    const onIncrementClick = (step: number) => {
        if (document.activeElement !== ref.current) {
            ref.current?.focus();
            props.onFocus?.({} as React.FocusEvent<HTMLInputElement>);
        }
        onIncrement?.(step);
    }

    // TODO: need to ensure user cannot type in invalid input
    return (
        <div className="numberinputfield">
            <InputField ref={ref} type="number" {...props} />
            {!!step && (<span>
                <button
                    type="button"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => onIncrementClick(+(step ?? 1))}>&and;</button>
                <button
                    type="button"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => onIncrementClick(-(step ?? 1))}>&or;</button>
            </span>)}
        </div>
    );
});
NumberInputField.displayName = "NumberInputField";
