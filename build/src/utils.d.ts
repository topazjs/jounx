export declare type basicallyAnyType = (Function | null | undefined | boolean | Promise<any> | number | bigint | {} | [] | string);
/**
 * Feed this whatever comes through the log or file writer to make something more
 * presentable.
 * @param   {Function|undefined|boolean|Promise<any>|number|{}|[]|string}         value   -   any type value to be converted to string for display in log
 * @returns {string}    stringified value
 */
export declare function getString(value: basicallyAnyType): string;
/**
 * Feed this whatever comes through the console to make something more
 * presentable.
 */
export declare function getPrettyString(value: basicallyAnyType): string;
