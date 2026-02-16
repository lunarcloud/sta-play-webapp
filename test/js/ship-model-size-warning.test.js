import { expect } from '@esm-bundle/chai'

describe('Ship Model Size Warning', () => {
  const maxSizeBytes = 56 * 1024 * 1024 // 56 MB

  describe('file size check', () => {
    it('should identify files larger than 56 MB', () => {
      const largeFile = new File([''], 'large.glb', { type: 'model/gltf-binary' })
      Object.defineProperty(largeFile, 'size', { value: maxSizeBytes + 1 })
      expect(largeFile.size).to.be.greaterThan(maxSizeBytes)
    })

    it('should identify files exactly 56 MB as not exceeding threshold', () => {
      const exactFile = new File([''], 'exact.glb', { type: 'model/gltf-binary' })
      Object.defineProperty(exactFile, 'size', { value: maxSizeBytes })
      expect(exactFile.size).to.equal(maxSizeBytes)
      expect(exactFile.size).to.not.be.greaterThan(maxSizeBytes)
    })

    it('should identify files smaller than 56 MB', () => {
      const smallFile = new File([''], 'small.glb', { type: 'model/gltf-binary' })
      Object.defineProperty(smallFile, 'size', { value: maxSizeBytes - 1 })
      expect(smallFile.size).to.be.lessThan(maxSizeBytes)
    })
  })

  describe('size formatting', () => {
    it('should format bytes to MB correctly', () => {
      const bytes = 60 * 1024 * 1024 // 60 MB
      const sizeMB = (bytes / (1024 * 1024)).toFixed(2)
      expect(sizeMB).to.equal('60.00')
    })

    it('should format fractional MB correctly', () => {
      const bytes = 57.5 * 1024 * 1024 // 57.5 MB
      const sizeMB = (bytes / (1024 * 1024)).toFixed(2)
      expect(sizeMB).to.equal('57.50')
    })
  })
})
