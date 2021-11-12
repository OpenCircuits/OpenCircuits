import React from "react";

import {OperatorFormat, TokenType} from "digital/utils/ExpressionParser/Constants/DataStructures";


type Props = {
    customOps: OperatorFormat;
    setCustomOps: React.Dispatch<React.SetStateAction<OperatorFormat>>;
}

export const CustomOps = (({customOps, setCustomOps}: Props) => {
    // Contains string represenation and internal representation for operations
    const operationReps: [string, TokenType][] = [
        ["AND", "&"],
        ["OR", "|"],
        ["XOR", "^"],
        ["NOT", "!"],
        ["(", "("],
        [")", ")"],
    ];

    return (
        <div>
            {
                operationReps.map((op) =>
                    <div className="exprtocircuit__popup__customOps" key={op[0]}>
                        <input title={"Enter symbol for " + op[0]} type="text" value={customOps.ops[op[1]]}
                               onChange={e => setCustomOps({...customOps, ops: {...customOps.ops, [op[1]]: e.target.value}})} />
                        <label htmlFor={customOps.ops[op[1]]}>Custom {op[0]}: "{customOps.ops[op[1]]}"</label>
                    </div>
                )

            }
            <div className="exprtocircuit__popup__customOps">
                <input title="Enter symbol for Separator" type="text" value={customOps.separator}
                       onChange={e => setCustomOps({...customOps, separator: e.target.value})} />
                <label htmlFor={customOps.separator}>Custom Separator: "{customOps.separator}"</label>
            </div>
        </div>
    );
});