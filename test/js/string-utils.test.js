import { expect } from '@esm-bundle/chai'
import { snakeToCamel, toCSV } from '../../js/string-utils.js'

describe('String Utils', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('hello_world')).to.equal('helloWorld')
      expect(snakeToCamel('my_variable_name')).to.equal('myVariableName')
    })

    it('should convert kebab-case to camelCase', () => {
      expect(snakeToCamel('hello-world')).to.equal('helloWorld')
      expect(snakeToCamel('my-variable-name')).to.equal('myVariableName')
    })

    it('should handle mixed separators', () => {
      expect(snakeToCamel('hello-world_test')).to.equal('helloWorldTest')
    })

    it('should handle single word', () => {
      expect(snakeToCamel('hello')).to.equal('hello')
    })

    it('should handle already lowercase string', () => {
      expect(snakeToCamel('alreadylowercase')).to.equal('alreadylowercase')
    })

    it('should handle uppercase input by converting to lowercase first', () => {
      expect(snakeToCamel('HELLO_WORLD')).to.equal('helloWorld')
      expect(snakeToCamel('HELLO-WORLD')).to.equal('helloWorld')
    })

    it('should handle multiple consecutive separators', () => {
      // Note: The function converts each separator separately, which can result in unexpected casing
      expect(snakeToCamel('hello__world')).to.equal('hello_World')
      expect(snakeToCamel('hello--world')).to.equal('hello-World')
    })

    it('should handle empty string', () => {
      expect(snakeToCamel('')).to.equal('')
    })
  })

  describe('toCSV', () => {
    it('should convert array to comma-separated string', () => {
      expect(toCSV(['a', 'b', 'c'])).to.equal('a,b,c')
    })

    it('should handle single element array', () => {
      expect(toCSV(['single'])).to.equal('single')
    })

    it('should handle empty array', () => {
      expect(toCSV([])).to.equal('')
    })

    it('should handle numeric values', () => {
      expect(toCSV([1, 2, 3])).to.equal('1,2,3')
    })

    it('should handle mixed types', () => {
      expect(toCSV(['text', 42, true])).to.equal('text,42,true')
    })

    it('should handle values with spaces', () => {
      expect(toCSV(['hello world', 'foo bar'])).to.equal('hello world,foo bar')
    })

    it('should handle values that contain commas', () => {
      expect(toCSV(['a,b', 'c'])).to.equal('a,b,c')
    })
  })
})
