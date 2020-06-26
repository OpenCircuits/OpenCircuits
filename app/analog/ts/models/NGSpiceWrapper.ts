import { Callbacks } from "jquery";


/**
 * Wrapper for using the NGSpice library
 * Details about ngspice as shared library or dynamic link library are on
 * page 399 of the ngspice user's manual.
 */

/**
 * TODO: Define callback functions as global functions in the caller,
 * so to be reachable by the C-coded ngspice. 
 */

// typedef int (SendChar)(char*,int,void*)
// char* : string to be sent to caller output
// int : identification number of calling ngspice shared lib (default is 0)
// void* : return pointer recieved from caller during initialization
//         e.g. pointer to object having sent the request. Each callback
//         function has a void pointer as the last parameter