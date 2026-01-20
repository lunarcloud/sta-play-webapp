# Code Review Guide

This guide documents common code review feedback patterns and how to address them effectively.

## Table of Contents
- [Review Process](#review-process)
- [Common Feedback Categories](#common-feedback-categories)
- [How to Address Feedback](#how-to-address-feedback)
- [Visual Design Checklist](#visual-design-checklist)
- [Code Quality Checklist](#code-quality-checklist)

## Review Process

### What to Expect

1. **Initial Review (24-48 hours):** Maintainer reviews PR for overall approach and major issues
2. **Iterative Refinement (multiple rounds):** Expect 2-4 rounds of feedback and updates
3. **Final Approval:** Once all feedback addressed and CI passes, PR is merged

### Response Time

- Maintainer typically responds within 1-2 business days
- Contributors should address feedback within 1 week
- Complex changes may take longer to review

## Common Feedback Categories

### 1. Visual Design and Layout

#### Color Contrast and Readability

**Common Feedback:**
> "The text is hard to read against this background. Can you increase the contrast?"
> "This element is barely visible. Please make it more prominent."

**How to Address:**
```css
/* Before - poor contrast */
.element {
  color: #888;
  background: #999;
}

/* After - better contrast */
.element {
  color: #333;
  background: #f5f5f5;
}
```

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools → Accessibility → Contrast ratio
- Target: WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)

#### Grid Positioning

**Common Feedback:**
> "This element is spanning the wrong grid rows. It should be on rows 2-3, not 2-4."
> "The decoration is pushing content down. Use absolute positioning or adjust grid placement."

**How to Address:**
```css
/* Before - incorrect span */
.element {
  grid-row: 2 / 4;  /* Spans rows 2, 3 */
}

/* After - correct span */
.element {
  grid-row: 2 / 3;  /* Spans only row 2 */
}

/* For decorative elements that shouldn't affect layout */
.decoration {
  position: absolute;
  /* or */
  grid-row: 1 / -1;  /* Span all rows */
  z-index: -1;       /* Behind content */
  pointer-events: none;
}
```

**Debugging:**
- Use browser DevTools → Grid inspector
- Verify parent's `grid-template-rows` definition
- Check if decoration elements use absolute positioning

#### Element Sizing and Visibility

**Common Feedback:**
> "The menu icon is too small. Make it 24x24 or larger."
> "This button is hard to see. Increase its size/prominence."

**How to Address:**
```css
/* Before - too small */
.icon {
  width: 16px;
  height: 16px;
}

/* After - appropriate size */
.icon {
  width: 24px;
  height: 24px;
}

/* For important UI controls */
.primary-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-width: 100px;
}
```

### 2. Code Quality

#### CSS Duplication

**Common Feedback:**
> "These colors/sizes are repeated. Extract them into CSS variables."
> "Use CSS custom properties to reduce duplication and improve maintainability."

**How to Address:**
```css
/* Before - duplication */
.element1 {
  background: #1a3a52;
  border: 2px solid #1a3a52;
  box-shadow: 0 2px 4px rgba(26, 58, 82, 0.3);
}

.element2 {
  color: #1a3a52;
  border-bottom: 1px solid #1a3a52;
}

/* After - using CSS variables */
:root {
  --primary-blue: #1a3a52;
  --shadow-color: rgba(26, 58, 82, 0.3);
}

.element1 {
  background: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.element2 {
  color: var(--primary-blue);
  border-bottom: 1px solid var(--primary-blue);
}
```

#### Missing JSDoc

**Common Feedback:**
> "Please add JSDoc comments to this method."
> "Document the parameters and return value."

**How to Address:**
```javascript
// Before - no documentation
function calculateProgress(current, max) {
  return (current / max) * 100
}

// After - with JSDoc
/**
 * Calculate progress percentage
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @returns {number} Progress percentage (0-100)
 * @throws {Error} If max is zero
 */
function calculateProgress(current, max) {
  if (max === 0) {
    throw new Error('Max cannot be zero')
  }
  return (current / max) * 100
}
```

#### Input Validation Missing

**Common Feedback:**
> "Add validation for empty strings."
> "Handle null/undefined values."

**How to Address:**
```javascript
// Before - no validation
set name(value) {
  this.#name = value
  this.#render()
}

// After - with validation
/**
 * Sets the name
 * @param {string} value - The name
 * @throws {Error} If value is empty or not a string
 */
set name(value) {
  if (typeof value !== 'string') {
    throw new Error('Name must be a string')
  }
  if (!value || value.trim() === '') {
    throw new Error('Name cannot be empty')
  }
  this.#name = value.trim()
  this.#render()
}
```

### 3. Theme and Styling

#### Theme-Specific Issues

**Common Feedback:**
> "The decoration shouldn't take up layout space."
> "This change affects all themes, but it should only affect [specific theme]."

**How to Address:**
```css
/* Before - affects layout */
.theme-decoration {
  display: block;
  height: 100px;  /* Pushes content down */
}

/* After - doesn't affect layout */
.theme-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

/* Theme-specific changes only */
/* Before - global change */
.player-card {
  padding: 2rem;
}

/* After - theme-specific */
[data-theme="new-theme"] .player-card {
  padding: 2rem;
}
```

#### Preserving Original Aesthetic

**Common Feedback:**
> "This changes the overall look too much. Keep the original aesthetic."
> "Only enhance visibility, don't redesign the entire component."

**How to Address:**
- Make minimal changes to achieve the goal
- Test with original theme to ensure no unintended changes
- When asked to enhance visibility, adjust only the specified elements
- Preserve colors, fonts, and spacing unless explicitly requested

### 4. Testing

#### Missing Tests

**Common Feedback:**
> "Please add tests for this new component."
> "Add tests for edge cases (null, empty, invalid values)."

**How to Address:**
```javascript
// Add comprehensive tests
describe('MyComponent', () => {
  describe('property setter', () => {
    it('should handle valid value', () => {
      const el = new MyComponent()
      el.value = 'valid'
      expect(el.value).to.equal('valid')
    })

    it('should handle empty string', () => {
      const el = new MyComponent()
      expect(() => { el.value = '' }).to.throw('cannot be empty')
    })

    it('should handle null', () => {
      const el = new MyComponent()
      expect(() => { el.value = null }).to.throw()
    })

    it('should handle undefined', () => {
      const el = new MyComponent()
      expect(() => { el.value = undefined }).to.throw()
    })
  })
})
```

## How to Address Feedback

### 1. Read Carefully

- Understand what's being asked before making changes
- If unclear, ask for clarification in PR comments
- Look at linked examples or references

### 2. Make Targeted Changes

```markdown
❌ Bad: Making sweeping changes that affect unrelated code
✅ Good: Changing only what was requested
```

**Example:**
```
Feedback: "Make the menu icon larger"

❌ Bad response: Increase all icon sizes globally
✅ Good response: Increase only the menu icon size
```

### 3. Test Your Changes

Before pushing updates:
```bash
npm run lint-fix    # Fix style issues
npm test            # Verify tests pass
npm run serve       # Visual check in browser
```

### 4. Document Changes

In your response to feedback:
```markdown
✅ Fixed color contrast on .player-card (increased to 4.8:1)
✅ Corrected grid positioning to rows 2-3
✅ Added input validation for empty strings
✅ Added tests for edge cases

See updated screenshots below:
[screenshot]
```

### 5. Request Re-review

After addressing all feedback:
- Add comment: "All feedback addressed, ready for re-review"
- Ensure CI passes (check GitHub Actions status)
- Add new screenshots if UI changed

## Visual Design Checklist

Use this checklist when making UI changes:

### Accessibility
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Interactive elements are at least 24x24 pixels
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator of state

### Layout
- [ ] Grid positioning is correct (verify with DevTools)
- [ ] Decorative elements don't affect content layout
- [ ] Responsive design works at different screen sizes
- [ ] No unintended layout shifts

### Visual Hierarchy
- [ ] Important elements are prominent
- [ ] Secondary elements are less prominent
- [ ] Visual weight matches importance
- [ ] Spacing is consistent

### Theme Integration
- [ ] Changes work with all themes (or are theme-specific)
- [ ] Original aesthetic preserved unless redesign requested
- [ ] Theme decorations positioned correctly
- [ ] CSS variables used for colors/sizes

### Screenshots
- [ ] Before/after screenshots included
- [ ] Multiple states shown (default, hover, active)
- [ ] Different screen sizes if responsive changes
- [ ] For themes: traits, player cards, red alert, tracker

## Code Quality Checklist

### JavaScript
- [ ] JSDoc comments on all public methods
- [ ] Private fields use `#` prefix
- [ ] Input validation added
- [ ] Edge cases handled (null, undefined, empty)
- [ ] Errors thrown for invalid input
- [ ] No console.log statements
- [ ] Follows existing patterns

### CSS
- [ ] CSS variables used for repeated values
- [ ] Scoped properly (Shadow DOM or specific selectors)
- [ ] No vendor prefixes needed (or fallbacks provided)
- [ ] Responsive design included
- [ ] No magic numbers (use named variables)

### Tests
- [ ] Tests added for new functionality
- [ ] Tests updated for changed behavior
- [ ] Edge cases tested
- [ ] Events tested
- [ ] Shadow DOM structure tested
- [ ] All tests pass

### General
- [ ] Backwards compatible with `.staplay` files
- [ ] No breaking changes (or migration provided)
- [ ] Works in Chrome, Edge, Safari, Firefox
- [ ] No new dependencies (or justified)
- [ ] Linters pass

## Common Mistakes to Avoid

### 1. Over-correcting

**Feedback:** "Make the menu icon more visible"

❌ **Bad:** Increase all icon sizes, change all colors, redesign the entire header
✅ **Good:** Increase menu icon size by 8px, ensure 4.5:1 contrast

### 2. Not Testing

❌ **Bad:** Push changes without testing in browser
✅ **Good:** Test changes locally, verify in multiple browsers

### 3. Ignoring Patterns

❌ **Bad:** Implement new pattern different from existing code
✅ **Good:** Follow patterns in similar components

### 4. Incomplete Changes

❌ **Bad:** Address one piece of feedback, ignore others
✅ **Good:** Address all feedback in PR, or explain why not

### 5. Breaking Changes

❌ **Bad:** Change API without considering existing usage
✅ **Good:** Maintain backwards compatibility or provide migration

## Tips for Smooth Reviews

### For Contributors

1. **Self-review first:** Check your own code before submitting
2. **Follow checklist:** Use PR template checklist
3. **Include screenshots:** Always for UI changes
4. **Write clear descriptions:** Explain what and why
5. **Respond promptly:** Address feedback within a week
6. **Ask questions:** If feedback is unclear, ask
7. **Be open to iteration:** Expect multiple rounds

### For Small Changes

- Focus on one thing at a time
- Keep PR small (< 500 lines if possible)
- Write clear commit messages
- Update relevant documentation

### For Large Changes

- Break into multiple PRs if possible
- Discuss approach before implementation
- Include comprehensive tests
- Document architectural decisions

## Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture patterns
- [COMPONENT_TEMPLATE.md](COMPONENT_TEMPLATE.md) - Component creation guide
- [TESTING.md](TESTING.md) - Testing guide
- [LINTING.md](LINTING.md) - Code style guide
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
