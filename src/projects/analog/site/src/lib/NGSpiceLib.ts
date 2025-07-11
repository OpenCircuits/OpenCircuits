/* eslint-disable @typescript-eslint/naming-convention */
import {WASMModule} from "./WASM";


export type NGSpiceLib = WASMModule & {
    OC_init(): void;
    OC_set_data(data: number): number;
    OC_run(): void;

    OC_get_plot_ids(): number; // => string[] ptr
    OC_get_cur_plot(): number; // => string ptr

    OC_get_vector_ids(plot: number): number; // plot: string ptr => string[] ptr
    OC_get_vector_len(id: number): number; // id: string ptr => length of vec
    OC_get_vector_data(id: number): number; // id: string ptr => double[] ptr
    OC_get_vector_data_im(id: number): number; // id: string ptr => ngcomplex_t[] ptr

    OC_print_data(): void;
}
