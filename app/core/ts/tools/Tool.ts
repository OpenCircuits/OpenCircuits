import {Input} from "core/utils/Input";
import {MouseListener} from "core/utils/MouseListener";
import {KeyboardListener} from "core/utils/KeyboardListener";

import {Action} from "core/actions/Action";

export abstract class Tool implements MouseListener, KeyboardListener {
    private disabled: boolean = false;

    /**
     * Checks if this tool should be activated
     *
     * @param  currentTool The tool currently active
     * @param  event       The current event (onclick, keyup, etc.)
     * @param  input       The Input class
     * @param  button      The button/key that was pressed/released
     * @return             True if the tool should be activated
     *                     False otherwise
     */
    public abstract shouldActivate(currentTool: Tool, event: string, input: Input, button?: number): boolean;


    /**
     * Checks if this tool should be deactivated
     *
     * @param  event  The current event (onclick, keyup, etc.)
     * @param  input  The Input class
     * @param  button The button/key that was pressed/release
     * @return        True if the tool should be deactivated
     *                False otherwise
     */
    public abstract shouldDeactivate(event: string, input: Input, button?: number): boolean;


    public activate(_currentTool: Tool, _event: string, _input: Input, _button?: number): void {
    }
    public deactivate(): Action {
        return undefined;
    }

    public setDisabled(val: boolean): void {
        this.disabled = val;
    }

    public onMouseDown(_input: Input, _button: number): boolean {
        return false;
    }

    public onMouseMove(_input: Input): boolean {
        return false;
    }

    public onMouseDrag(_input: Input, _button: number): boolean {
        return false;
    }

    public onMouseUp(_input: Input, _button: number): boolean {
        return false;
    }

    public onClick(_input: Input, _button: number): boolean {
        return false;
    }

    public onDoubleClick(_input: Input, _button: number): boolean {
        return false;
    }

    public onKeyDown(_input: Input, _key: number): boolean {
        return false;
    }

    public onKeyUp(_input: Input, _key: number): boolean {
        return false;
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

}
