// sim.cpp
#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "sharedspice.h"


extern "C" {
    void OC_init();
    int OC_set_data(char** data);
    void OC_run();

    char** OC_get_plot_ids();
    char* OC_get_cur_plot();

    char** OC_get_vector_ids(char* plot);
    int OC_get_vector_len(char* id);
    double* OC_get_vector_data(char* id);
    ngcomplex_t* OC_get_vector_data_im(char* id);

    void OC_print_data();
}

EMSCRIPTEN_KEEPALIVE
int OC_SendChar(char* str, int id, void* p) {
    printf("id: %d | recieved %s\n", id, str);
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int OC_SendStat(char* status, int id, void* p) {
    printf("id: %d | status: %s\n", id, status);
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int OC_ControlledExit(int status, bool unload, bool exit, int id, void* p) {
    printf("id: %d | exit: %d, %d, %d\n", id, status, unload, exit);
    return status;
}

EMSCRIPTEN_KEEPALIVE
int OC_SendData(vecvaluesall* data, int numstructs, int id, void* p) {
    // printf("id: %d | data recieved: %d\n", id, numstructs);//data->vecsa[0]->creal);
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int OC_SendInitData(vecinfoall* data, int id, void* p) {
    printf("id: %d | init data recieved\n", id);
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int OC_BGThreadRunning(bool running, int id, void* p) {
    if (running) {
        printf("id: %d | ng is running\n", id);
    } else {
        printf("id: %d | ng is not running\n", id);
    }
    return 0;
}



EMSCRIPTEN_KEEPALIVE
void OC_init() {
    ngSpice_Init(
        &OC_SendChar, &OC_SendStat, &OC_ControlledExit,
        &OC_SendData, &OC_SendInitData, &OC_BGThreadRunning,
        (void*) NULL
    );
}

EMSCRIPTEN_KEEPALIVE
int OC_set_data(char** data) {
    return ngSpice_Circ(data);
}

EMSCRIPTEN_KEEPALIVE
void OC_run() {
    ngSpice_Command("run");
}


EMSCRIPTEN_KEEPALIVE
char** OC_get_plot_ids() {
    return ngSpice_AllPlots();
}

EMSCRIPTEN_KEEPALIVE
char* OC_get_cur_plot() {
    return ngSpice_CurPlot();
}


EMSCRIPTEN_KEEPALIVE
char** OC_get_vector_ids(char* plot) {
    return ngSpice_AllVecs(OC_get_cur_plot());
}

// Note, id is of the form: `PLOT.VECID`
EMSCRIPTEN_KEEPALIVE
int OC_get_vector_len(char* id) {
    pvector_info vec_info = ngGet_Vec_Info(id);
    return vec_info->v_length;
}

EMSCRIPTEN_KEEPALIVE
double* OC_get_vector_data(char* id) {
    pvector_info vec_info = ngGet_Vec_Info(id);
    return vec_info->v_realdata;
}

EMSCRIPTEN_KEEPALIVE
ngcomplex_t* OC_get_vector_data_im(char* id) {
    pvector_info vec_info = ngGet_Vec_Info(id);
    return vec_info->v_compdata;
}


EMSCRIPTEN_KEEPALIVE
void OC_print_data() {
    char *current_plot = ngSpice_CurPlot ();
    printf ("Current plot is %s\n", current_plot);
    char **all_plots = ngSpice_AllPlots ();
    int i = 0;
    while (all_plots[i])
    {
        printf ("plot[%i] %s\n", i, all_plots[i]);
        i++;
    }
    char **all_vectors = ngSpice_AllVecs (current_plot);
    i = 0;
    while (all_vectors[i])
    {
        char *vector_name = all_vectors[i];
        char name[256];
        sprintf (name, "%s.%s", current_plot, vector_name);
        pvector_info vector_info = ngGet_Vec_Info (name);
        int length = vector_info->v_length;
        printf ("vector[%i] %s actual length %i\n", i, name, length);
        i++;
    }
}

// int main() {
//     char** circarray = (char**)malloc(sizeof(char*) * 7);
//     circarray[0] = strdup(".title test array");
//     circarray[1] = strdup("V1 1 0 1");
//     circarray[2] = strdup("R1 1 2 1");
//     circarray[3] = strdup("C1 2 0 1 ic=0");
//     circarray[4] = strdup(".tran 10u 3 uic");
//     circarray[5] = strdup(".end");
//     circarray[6] = NULL;
//     int err = ngSpice_Circ(circarray);
//     return 0;
// }