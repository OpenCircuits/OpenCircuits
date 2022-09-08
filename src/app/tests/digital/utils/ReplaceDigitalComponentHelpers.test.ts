import {GetHelpers} from "test/helpers/Helpers";

import {CreateDigitalComponent, GenerateReplacementList, GetReplacements} from "digital/utils/ReplaceDigitalComponentHelpers";

import {SetCoderPortCount} from "digital/actions/compositions/SetCoderPortCount";

import {AddICData}         from "digital/actions/units/AddICData";
import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {DigitalCircuitDesigner} from "digital/models";

import {ANDGate, Demultiplexer, Encoder, ICData, LED, ORGate, Switch} from "digital/models/ioobjects";


describe("ReplaceDigitalComponentHelpers", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);
    const [a, b, or, out] = Place(new Switch(), new Switch(), new ORGate(), new LED());
    Connect(a, 0, or, 0);
    Connect(b, 0, or, 1);
    Connect(or, 0, out, 0);
    const data = ICData.Create([a, b, or, out])!;
    AddICData(data, designer);
    const baseComponentIDs = ["ANDGate", "ORGate", "Multiplexer", "Demultiplexer", "Encoder", "Decoder", "ic/0"];
    const list = GenerateReplacementList(designer, baseComponentIDs);

    describe("GenerateReplacementList", () => {
        test("Basic components", () => {
            const twoOne = list.get("2:1")!;
            const twoOneExpected = ["ANDGate", "Encoder", "ic/0", "ORGate"];
            expect(twoOne).toBeDefined();
            expect(twoOne.map((entry) => entry.id).sort()).toEqual(twoOneExpected.sort());

            const threeOne = list.get("3:1")!;
            const threeOneExpected = ["ANDGate", "Multiplexer", "ORGate"]
            expect(threeOne).toBeDefined();
            expect(threeOne.map((entry) => entry.id).sort()).toEqual(threeOneExpected.sort());
        });

        test("Invalid component id", () => {
            const newDesigner = new DigitalCircuitDesigner(0);
            expect(() => GenerateReplacementList(newDesigner, ["Invalid component id"])).toThrow();
        });
    });

    describe("GetReplacements", () => {
        test("ANDGate", () => {
            const [comp] = Place(new ANDGate());
            const filteredList = GetReplacements(comp, designer, list);
            const expected = ["ANDGate", "Encoder", "ic/0", "ORGate"];
            expect(filteredList.map((entry) => entry.id).sort()).toEqual(expected.sort());

            SetInputPortCount(comp, 8);
            const filteredList2 = GetReplacements(comp, designer, list);
            const expected2 = ["ANDGate", "ORGate"];
            expect(filteredList2.map((entry) => entry.id).sort()).toEqual(expected2.sort());
        });

        test("Demultiplexer", () => {
            const [comp] = Place(new Demultiplexer());
            const filteredList = GetReplacements(comp, designer, list);
            const expected = ["Demultiplexer"];
            expect(filteredList.map((entry) => entry.id).sort()).toEqual(expected.sort());
        });

        test("Encoder", () => {
            const [comp] = Place(new Encoder());
            const filteredList = GetReplacements(comp, designer, list);
            const expected = ["Encoder"];
            expect(filteredList.map((entry) => entry.id).sort()).toEqual(expected.sort());

            SetCoderPortCount(comp, 1);
            const filteredList2 = GetReplacements(comp, designer, list);
            const expected2 = ["ANDGate", "Encoder", "ic/0", "ORGate"];
            expect(filteredList2.map((entry) => entry.id).sort()).toEqual(expected2.sort());
        });

        test("IC", () => {
            const comp = CreateDigitalComponent("ic/0", designer);
            const filteredList = GetReplacements(comp, designer, list);
            const expected = ["ANDGate", "Encoder", "ic/0", "ORGate"];
            expect(filteredList.map((entry) => entry.id).sort()).toEqual(expected.sort());
        });
    });
});
