import "jest";

import {deserialize, message, serialize} from "core/ot/Serializing";

class BasicObject {
    str: string = "";
    val: number = 0;
};

class PolymorphicBase {
};
@message("PolymorphicStr")
class PolymorphicStr {
    val: string = "";
};
@message("PolymorphicNum")
class PolymorphicNum {
    val: number = 0;
};

class Obj {
    p: PolymorphicBase = new PolymorphicBase();
}

describe("Serializing", () => {
    test("basic object", () => {
        const o = new BasicObject();
        expect(serialize(o)).toBe(`{"str":"","val":0}`)
    });
    test("polymorphic field", () => {
        const o = new Obj();
        o.p = new PolymorphicNum();
        expect(serialize(o)).toBe(`{"p":{"val":0,"_type_":"PolymorphicNum"}}`);
    });
});

describe("DeSerializing", () => {
    test("basic object", () => {
        const o = new BasicObject();
        deserialize(o, `{"str":"hello","val":100}`);
        expect(o.str).toBe("hello");
        expect(o.val).toBe(100);
    });
    test("polymorphic field", () => {
        const o = new Obj();
        let res = deserialize(o, `{"p":{"val":100,"_type_":"PolymorphicNum"}}`);
        expect((<PolymorphicNum>o.p).val).toBe(100);
        res = deserialize(o, `{"p":{"val":"hello","_type_":"PolymorphicStr"}}`);
        expect((<PolymorphicStr>o.p).val).toBe("hello");
    });
});