
/**
 * Feed this whatever comes through the log or file writer to make something more
 * presentable.
 * @param   {*}         value   -   any type value to be converted to string for display in log
 * @returns {string}    stringified value
 */
export function getString ( value: Function|void|boolean|Promise<any>|number|{}|[]|string ): string {
    /**
     * Quick return since it will go through this all over again.
     */
    if ( typeof value === `function` ) {
        return getString(value());
    }

    if ( typeof value === `undefined` || value === null ) {
        return `${value}`;
    }

    if ( typeof value === `boolean` ) {
        return value
            ? `✔ true`
            : `✗ false`;
    }

    const isBadNumber = typeof value === `number` && (
        isNaN(value) || value === Infinity
    );

    if ( value instanceof Promise || isBadNumber ) {
        return `[unknown]`;
    }

    if ( typeof value === `object` ) {
        return JSON.stringify(value, null, 2);
    }

    if ( typeof value === `number` ) {
        return new Intl.NumberFormat(`en-US`).format(value);
    }

    return String(value);
}

/*
/!**
 * @param   {*}             defaultValue
 * @param   {function|*}    value
 * @returns {*}
 *!/
function getOptionValue ( defaultValue, optionValue = defaultValue ) {
    if ( typeof defaultValue === `function` ) {
        /!**
         * If this is already the same default value being passed in, just call the function with nothing so we don't
         * need to do more checking further down for no reason
         *!/
        if ( typeof optionValue === `function` ) {
            return defaultValue();
        }

        return defaultValue(optionValue);
    }

    return optionValue;
}

/!**
 * @param   {defaults}      options
 * @returns {getOptions}
 *!/
function makeOptionsGetter ( options ) {
    /!**
     * @param   {defaults}  defaults
     * @param   {string}    key
     * @returns {[ string, * ]}
     *!/
    return function getOptions ( defaults, key ) {
        if ( key in options ) {
            return {
                ...defaults,
                [ key ]: getOptionValue(defaults[ key ], options[ key ]),
            };
        }

        return {
            ...defaults,
            [ key ]: getOptionValue(defaults[ key ], defaults[ key ]),
        };
    };
}*/
