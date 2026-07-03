/* eslint-disable @typescript-eslint/naming-convention */
import {WASMModule} from "./WASM";


export type NGSpiceLib = WASMModule & {
    _OC_init(): void;
    _OC_set_data(data: number): number;
    _OC_run(): void;

    _OC_get_plot_ids(): number; // => string[] ptr
    _OC_get_cur_plot(): number; // => string ptr

    _OC_get_vector_ids(plot: number): number; // plot: string ptr => string[] ptr
    _OC_get_vector_len(id: number): number; // id: string ptr => length of vec
    _OC_get_vector_data(id: number): number; // id: string ptr => double[] ptr
    _OC_get_vector_data_im(id: number): number; // id: string ptr => ngcomplex_t[] ptr

    _OC_print_data(): void;
}
