import {Component, ReadonlyComponent} from "./Component";
import {Port, ReadonlyPort}      from "./Port";
import {ReadonlyWire, Wire}      from "./Wire";


export type Obj = Component | Port | Wire;
export type ReadonlyObj = ReadonlyComponent | ReadonlyPort | ReadonlyWire;
