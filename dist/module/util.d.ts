export declare const Keys: <T = Record<string, any>>(obj: T) => (keyof T)[];
export declare function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, fields: K[]): Omit<T, K>;
