/**
 * Convert a string from snake_case or kebob-case to CamelCase
 * @param {string} value string to modify
 * @returns {string} modified string
 */
export function snakeToCamel (value) {
    return value.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    )
}

/**
 * Create a comma-separated list string
 * @param {Array} values 
 * @returns {string} csv
 */
export function toCSV (values) {
    return values.join(',')
}