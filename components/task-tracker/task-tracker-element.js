/**
 * Extended Task / Combat Tracking Widget
 */

/**
 * List of Character Attributes
 */
const AttributeNames = [
    'Control',
    'Fitness',
    'Presence',
    'Daring',
    'Insight',
    'Reason'
]

/**
 * List of Character Departments (2e) / Disciplines (1e)
 */
const DepartmentNames = [
    'Command',
    'Security',
    'Science',
    'Conn',
    'Engineering',
    'Medicine'
]

export class TaskTrackerElement extends HTMLElement {

    static get observedAttributes() {
        return [
            'name',
            'resistance',
            'complication-range',
            'attribute',
            'department',
            'progress'
        ];
      }

    #removeBtnEl
    #nameEl
    #resistanceEl
    #complicationRangeEl
    #attributeEl
    #departmentEl
    #progressEl

    /**
     * Constructor.
     */
    constructor () {
        super()

        const shadow = this.attachShadow({ mode: 'open' })

        // Apply external styles
        const linkElem = document.createElement('link')
        linkElem.setAttribute('rel', 'stylesheet')
        linkElem.setAttribute('href', 'components/task-tracker/task-tracker.css')

        // Attach the created element
        shadow.appendChild(linkElem)

        // remove button ⤫
        this.#removeBtnEl = document.createElement('button')
        this.#removeBtnEl.classList.add("remove")
        this.#removeBtnEl.textContent = '⤫'
        this.#removeBtnEl.addEventListener("click", () => {
            this.dispatchEvent(new Event('removed'))
            this.remove()
        });

        // name element
        try {
            this.#nameEl = document.createElement('h1')
            this.#nameEl.contentEditable = 'plaintext-only'
        } catch {
            this.#nameEl = document.createElement('input')
            if (this.#nameEl instanceof HTMLInputElement)
                this.#nameEl.type = 'text'
        }
        this.#nameEl.className = 'name'

        this.#useAttrOrDefault(this.#nameEl, 'name', 'Combat / Extended Task')

        this.#nameEl.addEventListener(
            this.#nameEl instanceof HTMLInputElement ? 'change' : 'input',
            _event => this.setAttribute('name', this.#nameEl instanceof HTMLInputElement ? this.#nameEl.value : this.#nameEl.textContent));

        // Data-List & Elements
        const listEl = document.createElement('dl')

        // resistance element
        this.#resistanceEl = document.createElement('input')
        this.#resistanceEl.type = 'number'
        this.#resistanceEl.max = '20'
        this.#resistanceEl.min = '0'
        this.#resistanceEl.className = 'resistance'
        this.#useAttrOrDefault(this.#resistanceEl, 'resistance', '0')
        this.#resistanceEl.addEventListener('change', _event => this.setAttribute('resistance', this.#resistanceEl.value));

        this.#addDataListItem(listEl, 'Resistance', this.#resistanceEl)

        // complication-range element
        this.#complicationRangeEl = document.createElement('input')
        this.#complicationRangeEl.type = 'number'
        this.#complicationRangeEl.max = '5'
        this.#complicationRangeEl.min = '0'
        this.#complicationRangeEl.className = 'complication-range'
        this.#useAttrOrDefault(this.#complicationRangeEl, 'complication-range', '0')
        this.#complicationRangeEl.addEventListener('change', _event => this.setAttribute('complication-range', this.#complicationRangeEl.value));

        this.#addDataListItem(listEl, 'Complication Range', this.#complicationRangeEl)

        // attribute element
        this.#attributeEl = document.createElement('select')
        this.#attributeEl.className = 'attribute'
        for (let attributeName of AttributeNames) {
            let attrOptionEl = document.createElement('option')
            attrOptionEl.textContent = attributeName
            this.#attributeEl.appendChild(attrOptionEl)
        }
        this.#useAttrOrDefault(this.#attributeEl, 'attribute', AttributeNames[0])
        this.#attributeEl.addEventListener('change', _event => this.setAttribute('attribute', this.#attributeEl.value));

        // department element
        this.#departmentEl = document.createElement('select')
        this.#departmentEl.className = 'department'
        for (let departmentName of DepartmentNames) {
            let depOptionEl = document.createElement('option')
            depOptionEl.textContent = departmentName
            this.#departmentEl.appendChild(depOptionEl)
        }
        this.#useAttrOrDefault(this.#departmentEl, 'department', DepartmentNames[0])
        this.#departmentEl.addEventListener('change', _event => this.setAttribute('department', this.#departmentEl.value));

        // add both attribute and department under the same heading
        this.#addDataListItem(listEl, 'Stats', this.#attributeEl, this.#departmentEl)

        // progress element
        this.#progressEl = document.createElement('input')
        this.#progressEl.type = 'number'
        this.#progressEl.max = '20'
        this.#progressEl.min = '1'
        this.#progressEl.className = 'progress'
        this.#useAttrOrDefault(this.#progressEl, 'progress', '3')
        this.#progressEl.addEventListener('change', _event => this.setAttribute('progress', this.#progressEl.value));

        this.#addDataListItem(listEl, 'Progress', this.#progressEl)

        // Put it together
        let internalEls = document.createElement('task-tracker-internal')
        internalEls.appendChild(this.#removeBtnEl)
        internalEls.appendChild(this.#nameEl)
        internalEls.appendChild(listEl)
        shadow.appendChild(internalEls)
    }

    /**
     * Add a new element to a list
     * @param {Element} listEl      list element to add to
     * @param {string} text         title text
     * @param {...Element} elements data elements
     */
    #addDataListItem(listEl, text, ...elements)  {
        let listTextEl = document.createElement('dt')
        listTextEl.textContent = text
        let listDataEl = document.createElement('dd')

        for (let element of elements)
            listDataEl.appendChild(element)
        listEl.appendChild(listTextEl)
        listEl.appendChild(listDataEl)
    }

    /**
     * Update the inner editable element with this element's attribute or a default
     * @param {Element} innerEl Element inside that is the editable source of the value
     * @param {string} attribute name of the attribute on this element
     * @param {string} defaultValue value if this element doesn't have a value set
     */
    #useAttrOrDefault(innerEl, attribute, defaultValue) {
        let value = this.getAttribute(attribute) ?? defaultValue
        //TODO this.setAttribute(attribute, value)

        if (innerEl instanceof HTMLInputElement || innerEl instanceof HTMLSelectElement)
            innerEl.value = value
        else
            innerEl.textContent = value
    }

    
    attributeChangedCallback (name, _oldValue, newValue) {
        switch (name) {

            case 'name':
                this.#nameEl.textContent = newValue
                return;

            case 'resistance':
                if (!isNaN(parseInt(newValue)))
                    this.#resistanceEl.value = newValue
                return;

            case 'complication-range':
                if (!isNaN(parseInt(newValue)))
                    this.#complicationRangeEl.value = newValue
                return;

            case 'attribute':
                if (!!this.#attributeEl.querySelector(`option[value="${newValue}"]`))
                    this.#attributeEl.value = newValue
                return;

            case 'department':
                if (!!this.#departmentEl.querySelector(`option[value="${newValue}"]`))
                    this.#departmentEl.value = newValue
                return;

            case 'progress':
                if (!isNaN(parseInt(newValue)))
                    this.#progressEl.value = newValue
                return;
        }
    }

}

// Register element
customElements.define('task-tracker', TaskTrackerElement)
globalThis.TaskTrackerElement = TaskTrackerElement
export default TaskTrackerElement
