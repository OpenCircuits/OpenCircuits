import {GroupPropInfo, Prop, PropInfo} from "core/models/PropInfo";


const merge = (a1: GroupPropInfo["isActive"], a2: GroupPropInfo["isActive"]): GroupPropInfo["isActive"] => {
    if (a1 && a2) {
        return (states) => (a1(states) && a2(states));
    }
    return a1 ?? a2;
}

// TODO:
//  take the "initial"s only in this function
//  instead of as a property of `info` and return
//  the initial info as a 2nd parameter of a tuple!

export const GenPropInfo = (groups: GroupPropInfo[]): Record<string, PropInfo> => {
    const allInfos: Record<string, PropInfo[]> = {};

    const collectGroups = (groups: GroupPropInfo[], parentIsActive?: GroupPropInfo["isActive"]): void => {
        groups.forEach((group) => {
            const { isActive, infos, subgroups } = group;

            // Merge isActive w/ parentIsActive
            const groupIsActive = merge(isActive, parentIsActive);

            Object.entries(infos).forEach(([key, info]) => {
                if (!(key in allInfos))
                    allInfos[key] = [];
                allInfos[key].push(info);

                // Merge isActive with groupIsActive
                info.isActive = merge(info.isActive, groupIsActive);
            });
            collectGroups(subgroups ?? [], groupIsActive);
        });
    }
    collectGroups(groups);


    // Combine multi-infos together
    const info: Record<string, PropInfo> = {};

    Object.entries(allInfos).forEach(([key, infos]) => {
        const info0 = { ...infos[0] };
        info[key] = info0;

        // If exactly one info, then no need to merge
        if (infos.length === 1)
            return;

        // Merge displays
        if (infos.some(i => i.label !== info0.label)) {
            // This is necessary in the case where a property has multiple labels but shares
            //  the same ID, and is active at different times, so the label for the currently
            //  active state
            info0.label = (states) => {
                // Display based on isActive of the infos
                const display = infos.find((i) => (i.isActive?.(states) ?? true))?.label ?? "";
                return (
                    typeof display === "string"
                    ? display
                    : display(states)
                );
            }
        }

        // Merge isActives via union
        if (infos.some(i => !!i.isActive)) {
            // isActive if at least one of the infos is active
            info0.isActive = (states) => infos.some((i) => (i.isActive?.(states) ?? true));
        }
    });

    return info;
}


export const GenInitialInfo = (info: Record<string, PropInfo>): Record<string, Prop> => {
    return Object.fromEntries(
        Object.entries(info)
            .map(([key, info]) => [key, info.initial])
    );
}
