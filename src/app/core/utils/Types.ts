/** Of type T, all properties are optional except K */
export type RequireOnly<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;