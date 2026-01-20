## Change Type
<!-- Check all that apply -->
- [ ] 🐛 Bug fix
- [ ] ✨ New feature (component/utility/game mechanic)
- [ ] 🎨 UI/Theme change
- [ ] 📚 Documentation
- [ ] 🔧 Refactoring/Code quality
- [ ] 🧪 Tests only

## Describe your changes
<!-- Provide a clear description of what changed and why -->


## Screenshots
<!-- 
REQUIRED for any UI/visual changes.
For theme changes, MUST include:
- At least 2 traits displayed
- At least 2 player cards
- Red alert condition active
- At least 1 tracker visible
-->


## Issue ticket number and link
<!-- Link to related issue(s) -->


## Testing
<!-- Check all that apply -->
- [ ] New unit tests added for new functionality
- [ ] Existing tests updated for changed behavior
- [ ] All tests pass locally (`npm test`)
- [ ] Tested manually in browser (Chrome/Firefox/Safari/Edge)
- [ ] No console errors or warnings

## Checklist before requesting a review

### Code Quality
- [ ] I have performed a self-review of my code
- [ ] Code follows project conventions (see CONTRIBUTING.md)
- [ ] JSDoc comments added for all new public methods/classes
- [ ] The code passes all lint checks (`npm run lint`)
- [ ] No linting rules disabled without justification

### Testing
- [ ] The code has been tested for regressions of existing features
- [ ] New components include comprehensive tests (registration, attributes, properties, events, shadow DOM)
- [ ] New utilities include edge case tests (null, undefined, empty values)
- [ ] Tests follow patterns in `test/components/trait-display/trait-display-element.test.js`

### Compatibility & Security
- [ ] Backwards compatible with existing `.staplay` save files
- [ ] No breaking changes to database schema (or migration provided)
- [ ] Features work in Chrome, Edge, Safari, and Firefox
- [ ] No new external dependencies added (or justified if necessary)
- [ ] No secrets or API keys in code
- [ ] Input validation added for user-facing inputs

### Assets
- [ ] Images are optimized and use modern formats (webp, svg, avif)
- [ ] Icons are SVG format
- [ ] Textures are compressed (use Squoosh or similar)
- [ ] Fonts are WOFF2 format
- [ ] All assets properly licensed (CC0 for theme textures, no AI-generated art)

### Documentation
- [ ] Updated relevant documentation if behavior changed
- [ ] Added comments explaining complex logic
- [ ] Configuration constants documented if added

## CI Status
<!-- The GitHub Actions workflow will run automatically. All checks must pass before merge. -->
- Code Quality workflow status: (will be updated by CI)
