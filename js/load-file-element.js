/**
 * Get an element from an HTML file
 * @param {string} filePath         Path to the html file
 * @param {string} querySelector    Query to the element
 * @returns {Promise<Element>}      Element within the HTML
 */
export async function loadElementFromFile (filePath, querySelector) {
    const parser = new DOMParser()
    const resp = await fetch(filePath)
    const html = await resp.text()
    return parser.parseFromString(html, 'text/html').querySelector(querySelector)
}
