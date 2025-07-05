import {ItemNavConfig} from "shared/site/containers/ItemNav";

import buttonIcon         from "./icons/inputs/button.svg";
import switchIcon         from "./icons/inputs/switch.svg";
import constantLowIcon    from "./icons/inputs/constantlow.svg";
import constantHighIcon   from "./icons/inputs/constanthigh.svg";
import constantNumberIcon from "./icons/inputs/constantnumber.svg";
import clockIcon          from "./icons/inputs/clock.svg";

import ledIcon                 from "./icons/outputs/led.svg";
import sevenSegmentDisplayIcon from "./icons/outputs/sevensegmentdisplay.svg";
import oscilloscopeIcon        from "./icons/outputs/oscilloscope.svg";

import bufGateIcon  from "./icons/gates/bufgate.svg";
import notGateIcon  from "./icons/gates/notgate.svg";
import andGateIcon  from "./icons/gates/andgate.svg";
import nandGateIcon from "./icons/gates/nandgate.svg";
import orGateIcon   from "./icons/gates/orgate.svg";
import norGateIcon  from "./icons/gates/norgate.svg";
import xorGateIcon  from "./icons/gates/xorgate.svg";
import xnorGateIcon from "./icons/gates/xnorgate.svg";

import srFlipFlopIcon from "./icons/flipflops/srflipflop.svg";
import jkFlipFlopIcon from "./icons/flipflops/jkflipflop.svg";
import dFlipFlopIcon  from "./icons/flipflops/dflipflop.svg";
import tFlipFlopIcon  from "./icons/flipflops/tflipflop.svg";

import srLatchIcon from "./icons/latches/srlatch.svg";
import dLatchIcon  from "./icons/latches/dlatch.svg";

import multiplexerIcon   from "./icons/other/multiplexer.svg";
import demultiplexerIcon from "./icons/other/demultiplexer.svg";
import encoderIcon       from "./icons/other/encoder.svg";
import decoderIcon       from "./icons/other/decoder.svg";
import labelIcon         from "./icons/other/label.svg";


export const Config: ItemNavConfig = {
  "sections": [
    {
      "kind":  "inputs",
      "label": "Inputs",
      "items": [
        {
          "kind":  "Button",
          "label": "Button",
          "icon":  buttonIcon,
        },
        {
          "kind":  "Switch",
          "label": "Switch",
          "icon":  switchIcon,
        },
        {
          "kind":  "ConstantLow",
          "label": "Constant Low",
          "icon":  constantLowIcon,
        },
        {
          "kind":  "ConstantHigh",
          "label": "Constant High",
          "icon":  constantHighIcon,
        },
        {
          "kind":  "ConstantNumber",
          "label": "Constant Number",
          "icon":  constantNumberIcon,
        },
        {
          "kind":  "Clock",
          "label": "Clock",
          "icon":  clockIcon,
        },
      ],
    },
    {
      "kind":  "outputs",
      "label": "Outputs",
      "items": [
        {
          "kind":  "LED",
          "label": "LED",
          "icon":  ledIcon,
        },
        {
          "kind":  "SegmentDisplay",
          "label": "Segment Display",
          "icon":  sevenSegmentDisplayIcon,
        },
        {
          "kind":  "BCDDisplay",
          "label": "BCD Display",
          "icon":  sevenSegmentDisplayIcon,
        },
        {
          "kind":  "ASCIIDisplay",
          "label": "ASCII Display",
          "icon":  sevenSegmentDisplayIcon,
        },
        {
          "kind":  "Oscilloscope",
          "label": "Oscillo-scope",
          "icon":  oscilloscopeIcon,
        },
      ],
    },
    {
      "kind":  "gates",
      "label": "Logic Gates",
      "items": [
        {
          "kind":  "BUFGate",
          "label": "Buffer",
          "icon":  bufGateIcon,
        },
        {
          "kind":  "NOTGate",
          "label": "NOT",
          "icon":  notGateIcon,
        },
        {
          "kind":  "ANDGate",
          "label": "AND",
          "icon":  andGateIcon,
        },
        {
          "kind":  "NANDGate",
          "label": "NAND",
          "icon":  nandGateIcon,
        },
        {
          "kind":  "ORGate",
          "label": "OR",
          "icon":  orGateIcon,
        },
        {
          "kind":  "NORGate",
          "label": "NOR",
          "icon":  norGateIcon,
        },
        {
          "kind":  "XORGate",
          "label": "XOR",
          "icon":  xorGateIcon,
        },
        {
          "kind":  "XNORGate",
          "label": "XNOR",
          "icon":  xnorGateIcon,
        },
      ],
    },
    {
      "kind":  "flipflops",
      "label": "Flip Flops",
      "items": [
        {
          "kind":  "SRFlipFlop",
          "label": "SR",
          "icon":  srFlipFlopIcon,
        },
        {
          "kind":  "JKFlipFlop",
          "label": "JK",
          "icon":  jkFlipFlopIcon,
        },
        {
          "kind":  "DFlipFlop",
          "label": "D",
          "icon":  dFlipFlopIcon,
        },
        {
          "kind":  "TFlipFlop",
          "label": "T",
          "icon":  tFlipFlopIcon,
        },
      ],
    },
    {
      "kind":  "latches",
      "label": "Latches",
      "items": [
        {
          "kind":  "DLatch",
          "label": "D",
          "icon":  dLatchIcon,
        },
        {
          "kind":  "SRLatch",
          "label": "SR",
          "icon":  srLatchIcon,
        },
      ],
    },
    {
      "kind":  "other",
      "label": "Other",
      "items": [
        {
          "kind":  "Multiplexer",
          "label": "Mux",
          "icon":  multiplexerIcon,
        },
        {
          "kind":  "Demultiplexer",
          "label": "Demux",
          "icon":  demultiplexerIcon,
        },
        {
          "kind":  "Encoder",
          "label": "Encoder",
          "icon":  encoderIcon,
        },
        {
          "kind":  "Decoder",
          "label": "Decoder",
          "icon":  decoderIcon,
        },
        {
          "kind":  "Comparator",
          "label": "Comparator",
          "icon":  decoderIcon,
        },
        {
          "kind":  "Label",
          "label": "Label",
          "icon":  labelIcon,
        },
      ],
    },
  ],
};
