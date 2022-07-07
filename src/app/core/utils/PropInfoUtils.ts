import {GroupPropInfo, Prop, PropInfo} from "core/models/PropInfo";


export const GenPropInfo = (groups: GroupPropInfo[]): Record<string, PropInfo> => {
    const allInfos: Record<string, PropInfo[]> = {};

    const merge = (a1: GroupPropInfo["isActive"], a2: GroupPropInfo["isActive"]): GroupPropInfo["isActive"] => {
        if (a1 && a2) {
            return (state) => (a1(state) && a2(state));
        }
        return a1 ?? a2;

    }

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
        if (infos.some(i => i.display !== info0.display)) {
            info0.display = (state) => {
                // Display based on isActive of the infos
                const display = infos.find((i) => (i.isActive?.(state) ?? true))?.display ?? "";
                return (
                    typeof display === "string"
                    ? display
                    : display(state)
                );
            }
        }

        // Merge isActives via union
        if (infos.some(i => !!i.isActive)) {
            // isActive if at least one of the infos is active
            info0.isActive = (state) => infos.some((i) => (i.isActive?.(state) ?? true));
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
