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

  describe('warning message content', () => {
    it('should contain import-specific text for importing scenario', () => {
      const isImporting = true
      const sizeMB = '60.00'
      const message = isImporting
        ? `This campaign includes a 3D model that is ${sizeMB} MB in size. ` +
          'Large models may take additional time to load.\n\n' +
          'Do you want to load this model alongside the campaign data?'
        : `This 3D model is ${sizeMB} MB in size. Large models may increase load time, use more storage space, and make import/export slower.\n\n` +
          'Consider using a GLB compressor / 3D model optimizer to reduce the file size.\n\n' +
          'Do you still want to use this model?'

      expect(message).to.include('campaign includes')
      expect(message).to.include('load this model alongside the campaign data')
      expect(message).to.not.include('GLB compressor')
      expect(message).to.not.include('import/export slower')
    })

    it('should contain direct-selection text for normal scenario', () => {
      const isImporting = false
      const sizeMB = '60.00'
      const message = isImporting
        ? `This campaign includes a 3D model that is ${sizeMB} MB in size. ` +
          'Large models may take additional time to load.\n\n' +
          'Do you want to load this model alongside the campaign data?'
        : `This 3D model is ${sizeMB} MB in size. Large models may increase load time, use more storage space, and make import/export slower.\n\n` +
          'Consider using a GLB compressor / 3D model optimizer to reduce the file size.\n\n' +
          'Do you still want to use this model?'

      expect(message).to.include('This 3D model is')
      expect(message).to.include('GLB compressor')
      expect(message).to.include('import/export slower')
      expect(message).to.include('Do you still want to use this model?')
      expect(message).to.not.include('campaign includes')
      expect(message).to.not.include('alongside the campaign data')
    })

    it('should include file size in both message types', () => {
      const sizeMB = '60.00'

      const importMessage = `This campaign includes a 3D model that is ${sizeMB} MB in size. ` +
        'Large models may take additional time to load.\n\n' +
        'Do you want to load this model alongside the campaign data?'

      const directMessage = `This 3D model is ${sizeMB} MB in size. Large models may increase load time, use more storage space, and make import/export slower.\n\n` +
        'Consider using a GLB compressor / 3D model optimizer to reduce the file size.\n\n' +
        'Do you still want to use this model?'

      expect(importMessage).to.include(sizeMB)
      expect(directMessage).to.include(sizeMB)
    })
  })
})
