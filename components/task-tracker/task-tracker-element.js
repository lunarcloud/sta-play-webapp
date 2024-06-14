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
 * List of Ship Systems
 */
const SystemNames = [
    'Communications',
    'Engines',
    'Structure',
    'Computers',
    'Sensors',
    'Weapons'
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
            'ship-system',
            'ship-department',
            'progress'
        ];
      }

    #removeBtnEl
    #nameEl
    #resistanceEl
    #complicationRangeEl
    #attributeEl
    #departmentEl
    #shipSystemEl
    #shipDepartmentEl
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

        // Stats elemnts
        let [attributeEl, departmentEl] = this.#createStatEls(true)
        this.#attributeEl = attributeEl
        this.#departmentEl = departmentEl

        let [shipSystemEl, shipDepartmentEl] = this.#createStatEls(false)
        this.#shipSystemEl = shipSystemEl
        this.#shipDepartmentEl = shipDepartmentEl

        // add both attribute and department under the same heading
        let [listDtEl, listDdEl] = this.#addDataListItem(listEl, 'Stats',
            this.#attributeEl, this.#departmentEl,
            this.#shipSystemEl, this.#shipDepartmentEl)

        // Allow Toggling between Character and Ship Stats
        const statsToggleParentEl = document.createElement('label')
        statsToggleParentEl.classList.add('stats-toggle')

        const statsToggleSwitchEl = document.createElement('input')
        statsToggleSwitchEl.type = 'checkbox'
        listDdEl.classList.add('character') // start with character
        statsToggleSwitchEl.addEventListener('change', () => {
            listDdEl.classList.toggle('character')
            listDdEl.classList.toggle('ship')
        })

        const statsCharacterIconEl = document.createElement('img')
        statsCharacterIconEl.classList.add('character')
        statsCharacterIconEl.src = 'img/vulcan-salute.svg'

        const statsShipIconEl = document.createElement('img')
        statsShipIconEl.classList.add('ship')
        statsShipIconEl.src = 'img/starship-profile.svg'

        statsToggleParentEl.appendChild(statsToggleSwitchEl)
        statsToggleParentEl.appendChild(statsCharacterIconEl)
        statsToggleParentEl.appendChild(statsShipIconEl)
        listDtEl.appendChild(statsToggleParentEl)

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
        internalEls.setAttribute('part', 'internal')
        internalEls.appendChild(this.#removeBtnEl)
        internalEls.appendChild(this.#nameEl)
        internalEls.appendChild(listEl)
        shadow.appendChild(internalEls)
    }

    /**
     * Create stats elements
     * @param {boolean} isCharacter    whether this is for a character (or ship)
     * @returns {[HTMLSelectElement, HTMLSelectElement]}
     */
    #createStatEls(isCharacter) {

        const displayClass = isCharacter ? 'character' : 'ship'

        // Big Number, Attribute or System, element
        const bigStatAttr = isCharacter ? 'attribute' : 'ship-system'
        const bigStatEl = document.createElement('select')
        bigStatEl.classList.add(bigStatAttr, displayClass)

        const names = isCharacter ? AttributeNames : SystemNames

        for (let bigStatName of names) {
            let optionEl = document.createElement('option')
            optionEl.textContent = bigStatName
            optionEl.value = bigStatName
            bigStatEl.appendChild(optionEl)
        }
        this.#useAttrOrDefault(bigStatEl, bigStatAttr, names[0])
        bigStatEl.addEventListener('change', _event => this.setAttribute(bigStatAttr, bigStatEl.value));

        // Small Number, Department, element
        const smallStatAttr = isCharacter ? 'department' : 'ship-department'
        const smallStatEl = document.createElement('select')
        smallStatEl.classList.add(smallStatAttr, displayClass)
        for (let smallStatName of DepartmentNames) {
            let optionEl = document.createElement('option')
            optionEl.textContent = smallStatName
            optionEl.value = smallStatName
            smallStatEl.appendChild(optionEl)
        }
        this.#useAttrOrDefault(smallStatEl, smallStatAttr, DepartmentNames[0])
        smallStatEl.addEventListener('change', _event => this.setAttribute(smallStatAttr, smallStatEl.value));

        return [ bigStatEl, smallStatEl ]
    }

    /**
     * Add a new element to a list
     * @param {Element} listEl      list element to add to
     * @param {string} text         title text
     * @param {...Element} elements data elements
     * @return {HTMLElement[]}      the dt and dd elements
     */
    #addDataListItem(listEl, text, ...elements)  {
        let listTextEl = document.createElement('dt')
        listTextEl.textContent = text
        let listDataEl = document.createElement('dd')

        for (let element of elements)
            listDataEl.appendChild(element)
        listEl.appendChild(listTextEl)
        listEl.appendChild(listDataEl)

        return [listTextEl, listDataEl]
    }

    /**
     * Update the inner editable element with this element's attribute or a default
     * @param {Element} innerEl Element inside that is the editable source of the value
     * @param {string} attribute name of the attribute on this element
     * @param {string} defaultValue value if this element doesn't have a value set
     */
    #useAttrOrDefault(innerEl, attribute, defaultValue) {
        let value = this.getAttribute(attribute) ?? defaultValue

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

            case 'ship-system':
                if (!!this.#shipSystemEl.querySelector(`option[value="${newValue}"]`))
                    this.#shipSystemEl.value = newValue
                return;

            case 'ship-department':
                if (!!this.#shipDepartmentEl.querySelector(`option[value="${newValue}"]`))
                    this.#shipDepartmentEl.value = newValue
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
