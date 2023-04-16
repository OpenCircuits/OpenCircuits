import {Component} from "./Component";
import {Obj}       from "./Obj";
import {Port}      from "./Port";
import {Wire}      from "./Wire";


export const isObjComponent = (obj: Obj): obj is Component => (obj.baseKind === "Component");
export const isObjWire      = (obj: Obj): obj is Wire      => (obj.baseKind === "Wire");
export const isObjPort      = (obj: Obj): obj is Port      => (obj.baseKind === "Port");
