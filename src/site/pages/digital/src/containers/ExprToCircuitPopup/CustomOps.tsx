import React from "react";

import {OperatorFormat, TokenType} from "digital/utils/ExpressionParser/Constants/DataStructures";

import {InputField} from "shared/components/InputField";


type Props = {
    customOps: OperatorFormat;
    setCustomOps: React.Dispatch<React.SetStateAction<OperatorFormat>>;
}
export const CustomOps = (({ customOps, setCustomOps }: Props) => {
    // Contains string represenation and internal representation for operations
    const operationReps: Array<[string, TokenType]> = [
        ["AND", "&"],
        ["OR", "|"],
        ["XOR", "^"],
        ["NOT", "!"],
        ["(", "("],
        [")", ")"],
    ];

    return (<div>
        {operationReps.map((op) =>
            (<div key={op[0]} className="exprtocircuit__popup__customOps">
                <InputField
                    type="text" title={"Enter symbol for " + op[0]} value={customOps.ops[op[1]]}
                    onChange={(e) => setCustomOps({ ...customOps, ops: { ...customOps.ops,
                                                                       [op[1]]: e.target.value } })} />
                <label htmlFor={customOps.ops[op[1]]}>Custom {op[0]}: &quot;{customOps.ops[op[1]]}&quot;</label>
            </div>)
        )}
        <div className="exprtocircuit__popup__customOps">
            <InputField title="Enter symbol for Separator" type="text" value={customOps.separator}
                        onChange={(e) => setCustomOps({ ...customOps, separator: e.target.value })} />
            <label htmlFor={customOps.separator}>Custom Separator: &quot;{customOps.separator}&quot;</label>
        </div>
    </div>);
});
