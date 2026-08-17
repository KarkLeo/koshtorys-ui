import { describe, it, expect } from 'vitest'
import { mapApiErrorCodes } from '@/helpers/api-errors'

describe('mapApiErrorCodes', () => {
  it('extracts errorCodes from an ApiError-like object', () => {
    const e = { errorCodes: { amount: 'amount_min', form: 'planning_not_found' } }
    expect(mapApiErrorCodes(e)).toEqual({ amount: 'amount_min', form: 'planning_not_found' })
  })

  it('returns an empty object for a plain Error', () => {
    expect(mapApiErrorCodes(new Error('boom'))).toEqual({})
  })

  it('returns an empty object for null and undefined', () => {
    expect(mapApiErrorCodes(null)).toEqual({})
    expect(mapApiErrorCodes(undefined)).toEqual({})
  })

  it('ignores a non-object errorCodes value', () => {
    expect(mapApiErrorCodes({ errorCodes: 'nope' })).toEqual({})
  })
})
