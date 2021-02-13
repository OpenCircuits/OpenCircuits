
export type ICItemNavData = {
    index: number;
    name: string;
}

export type ItemNavState = {
    isEnabled: boolean;
    isOpen: boolean;

    ics: ICItemNavData[];
}
