

export interface PortConfig {
    readonly counts: Readonly<Record<string, number>>;

    readonly groups: readonly string[];
}
