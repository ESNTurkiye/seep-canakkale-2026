import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { videoBase } from './videoBase.ts'

describe('videoBase', () => {
  test('strips a .jpg extension', () => {
    assert.equal(videoBase('/artwork/opening-trojan-horse.jpg'), '/artwork/opening-trojan-horse')
  })

  test('is not jpg-specific — strips any extension', () => {
    assert.equal(videoBase('/artwork/why-hero-leandros.png'), '/artwork/why-hero-leandros')
  })

  test('leaves an extensionless path unchanged', () => {
    assert.equal(videoBase('/artwork/opening-trojan-horse'), '/artwork/opening-trojan-horse')
  })
})
