import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isVisible,
  isInteractive,
  calculatePriorityScore,
  generateSelectors,
} from '~/utils/element-utils'

describe('element-utils', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      getComputedStyle: vi.fn(() => ({
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        cursor: 'default',
      })),
      innerHeight: 800,
    })
  })

  describe('isVisible', () => {
    it('should return true for visible element', () => {
      const div = document.createElement('div')
      div.style.display = 'block'
      Object.defineProperty(div, 'offsetWidth', { value: 100 })
      Object.defineProperty(div, 'offsetHeight', { value: 50 })

      const rect = { width: 100, height: 50, top: 0, left: 0, right: 100, bottom: 50 }
      div.getBoundingClientRect = () => rect as DOMRect

      expect(isVisible(div)).toBe(true)
    })

    it('should return false for hidden element', () => {
      const div = document.createElement('div')
      vi.stubGlobal('window', {
        getComputedStyle: vi.fn(() => ({
          display: 'none',
          visibility: 'visible',
          opacity: '1',
          cursor: 'default',
        })),
        innerHeight: 800,
      })

      expect(isVisible(div)).toBe(false)
    })

    it('should return false for zero size element', () => {
      const div = document.createElement('div')
      Object.defineProperty(div, 'offsetWidth', { value: 0 })
      Object.defineProperty(div, 'offsetHeight', { value: 0 })

      const rect = { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
      div.getBoundingClientRect = () => rect as DOMRect

      expect(isVisible(div)).toBe(false)
    })
  })

  describe('isInteractive', () => {
    it('should return true for button element', () => {
      const button = document.createElement('button')
      expect(isInteractive(button)).toBe(true)
    })

    it('should return true for anchor element', () => {
      const a = document.createElement('a')
      expect(isInteractive(a)).toBe(true)
    })

    it('should return true for input element', () => {
      const input = document.createElement('input')
      expect(isInteractive(input)).toBe(true)
    })

    it('should return true for element with onclick', () => {
      const div = document.createElement('div')
      div.setAttribute('onclick', 'handleClick()')
      expect(isInteractive(div)).toBe(true)
    })

    it('should return true for element with role="button"', () => {
      const div = document.createElement('div')
      div.setAttribute('role', 'button')
      expect(isInteractive(div)).toBe(true)
    })

    it('should return false for non-interactive div', () => {
      const div = document.createElement('div')
      expect(isInteractive(div)).toBe(false)
    })
  })

  describe('calculatePriorityScore', () => {
    it('should give higher score to button than div', () => {
      const button = document.createElement('button')
      button.textContent = 'Click me'
      Object.defineProperty(button, 'offsetWidth', { value: 100 })
      Object.defineProperty(button, 'offsetHeight', { value: 30 })
      button.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const div = document.createElement('div')
      div.textContent = 'Some text'
      Object.defineProperty(div, 'offsetWidth', { value: 100 })
      Object.defineProperty(div, 'offsetHeight', { value: 30 })
      div.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const buttonScore = calculatePriorityScore(button)
      const divScore = calculatePriorityScore(div)

      expect(buttonScore).toBeGreaterThan(divScore)
    })

    it('should give higher score to element with id', () => {
      const divWithId = document.createElement('div')
      divWithId.id = 'main-content'
      Object.defineProperty(divWithId, 'offsetWidth', { value: 100 })
      Object.defineProperty(divWithId, 'offsetHeight', { value: 30 })
      divWithId.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const divWithoutId = document.createElement('div')
      Object.defineProperty(divWithoutId, 'offsetWidth', { value: 100 })
      Object.defineProperty(divWithoutId, 'offsetHeight', { value: 30 })
      divWithoutId.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const scoreWithId = calculatePriorityScore(divWithId)
      const scoreWithoutId = calculatePriorityScore(divWithoutId)

      expect(scoreWithId).toBeGreaterThan(scoreWithoutId)
    })

    it('should boost score for clickable button significantly', () => {
      const button = document.createElement('button')
      button.textContent = 'Submit'
      Object.defineProperty(button, 'offsetWidth', { value: 100 })
      Object.defineProperty(button, 'offsetHeight', { value: 30 })
      button.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const score = calculatePriorityScore(button)

      // Button should have: isVisible(30) + isInteractive(25) + button tag(20) + textContent(5) + viewport center(10) = at least 90
      expect(score).toBeGreaterThan(85)
    })

    it('should boost score for anchor element', () => {
      const anchor = document.createElement('a')
      anchor.textContent = 'Link'
      anchor.href = '#'
      Object.defineProperty(anchor, 'offsetWidth', { value: 100 })
      Object.defineProperty(anchor, 'offsetHeight', { value: 30 })
      anchor.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const score = calculatePriorityScore(anchor)

      // Anchor should have: isVisible(30) + isInteractive(25) + anchor tag(15) + textContent(5) + viewport center(10) = at least 85
      expect(score).toBeGreaterThan(80)
    })

    it('should boost score for input button type', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'submit')
      input.value = 'Submit'
      Object.defineProperty(input, 'offsetWidth', { value: 100 })
      Object.defineProperty(input, 'offsetHeight', { value: 30 })
      input.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const score = calculatePriorityScore(input)

      // Input submit should have: isVisible(30) + isInteractive(25) + input button(18) + viewport center(10) = at least 83
      expect(score).toBeGreaterThan(75)
    })

    it('should reduce score for regular input fields', () => {
      const textInput = document.createElement('input')
      textInput.setAttribute('type', 'text')
      textInput.name = 'username'
      Object.defineProperty(textInput, 'offsetWidth', { value: 100 })
      Object.defineProperty(textInput, 'offsetHeight', { value: 30 })
      textInput.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const submitButton = document.createElement('input')
      submitButton.setAttribute('type', 'submit')
      Object.defineProperty(submitButton, 'offsetWidth', { value: 100 })
      Object.defineProperty(submitButton, 'offsetHeight', { value: 30 })
      submitButton.getBoundingClientRect = () =>
        ({ width: 100, height: 30, top: 350, left: 0, right: 100, bottom: 380 }) as DOMRect

      const textScore = calculatePriorityScore(textInput)
      const submitScore = calculatePriorityScore(submitButton)

      expect(submitScore).toBeGreaterThan(textScore)
    })
  })

  describe('generateSelectors', () => {
    it('should generate id selector when element has id', () => {
      const div = document.createElement('div')
      div.id = 'unique-id'

      const selectors = generateSelectors(div)

      expect(selectors.some((s) => s.type === 'id' && s.value === '#unique-id')).toBe(true)
    })

    it('should generate testid selector when element has data-testid', () => {
      const div = document.createElement('div')
      div.setAttribute('data-testid', 'submit-button')

      const selectors = generateSelectors(div)

      expect(
        selectors.some((s) => s.type === 'testid' && s.value === '[data-testid="submit-button"]')
      ).toBe(true)
    })

    it('should generate aria selector when element has aria-label', () => {
      const button = document.createElement('button')
      button.setAttribute('aria-label', 'Close dialog')

      const selectors = generateSelectors(button)

      expect(selectors.some((s) => s.type === 'aria' && s.value.includes('aria-label'))).toBe(true)
    })

    it('should generate name selector when element has name', () => {
      const input = document.createElement('input')
      input.name = 'email'

      const selectors = generateSelectors(input)

      expect(selectors.some((s) => s.type === 'name' && s.value === '[name="email"]')).toBe(true)
    })

    it('should generate structural selector as fallback', () => {
      const div = document.createElement('div')
      div.className = 'container'

      const selectors = generateSelectors(div)

      expect(selectors.length).toBeGreaterThan(0)
      expect(selectors.some((s) => s.type === 'structural')).toBe(true)
    })

    it('should return high confidence for id selector', () => {
      const div = document.createElement('div')
      div.id = 'main'

      const selectors = generateSelectors(div)
      const idSelector = selectors.find((s) => s.type === 'id')

      expect(idSelector?.confidence).toBeGreaterThanOrEqual(95)
    })
  })
})
