import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { realPhotoSrc } from './realPhoto.ts'

describe('realPhotoSrc', () => {
  test('inserts -real before a .jpg extension', () => {
    assert.equal(realPhotoSrc('/artwork/venues-homer-recital.jpg'), '/artwork/venues-homer-recital-real.jpg')
  })

  test('is not jpg-specific — inserts -real before any extension', () => {
    assert.equal(realPhotoSrc('/artwork/why-hero-leandros.png'), '/artwork/why-hero-leandros-real.png')
  })

  test('appends -real to an extensionless path', () => {
    assert.equal(realPhotoSrc('/artwork/opening-trojan-horse'), '/artwork/opening-trojan-horse-real')
  })
})
