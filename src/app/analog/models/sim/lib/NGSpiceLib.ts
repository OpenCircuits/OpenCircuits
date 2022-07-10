/* eslint-disable @typescript-eslint/naming-convention */
import {WASMModule} from "./WASM";


export type NGSpiceLib = WASMModule & {
    init(): void;
    set_data(data: number): number;
    run(): void;

    get_plot_ids(): number; // => string[] ptr
    get_cur_plot(): number; // => string ptr

    get_vector_ids(plot: number): number; // plot: string ptr => string[] ptr
    get_vector_len(id: number): number; // id: string ptr => length of vec
    get_vector_data(id: number): number; // id: string ptr => double[] ptr
    get_vector_data_im(id: number): number; // id: string ptr => ngcomplex_t[] ptr

    print_data(): void;
}
