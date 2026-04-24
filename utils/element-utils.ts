export interface ElementAnalysis {
  selectors: Array<{
    type: 'id' | 'testid' | 'aria' | 'name' | 'text' | 'structural'
    value: string
    confidence: number
  }>
  recommended: string
  isVisible: boolean
  isInteractive: boolean
  priority: number
  boundingBox: { x: number; y: number; width: number; height: number }
}

export function isVisible(element: Element): boolean {
  const htmlElement = element as HTMLElement
  const style = window.getComputedStyle(htmlElement)

  if (style.display === 'none') return false
  if (style.visibility === 'hidden') return false
  if (style.opacity === '0') return false
  if (htmlElement.offsetWidth === 0 || htmlElement.offsetHeight === 0) return false

  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false

  return true
}

export function isInteractive(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'option']

  if (interactiveTags.includes(tag)) return true

  const role = element.getAttribute('role')
  const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem']
  if (role && interactiveRoles.includes(role)) return true

  if (element.hasAttribute('onclick')) return true
  if (element.hasAttribute('ng-click')) return true
  if (element.hasAttribute('@click')) return true

  const style = window.getComputedStyle(element as HTMLElement)
  if (style.cursor === 'pointer') return true

  return false
}

export function calculatePriorityScore(element: Element): number {
  let score = 0

  if (isVisible(element)) score += 30
  if (isInteractive(element)) score += 20

  if (element.id) score += 15
  if (element.getAttribute('data-testid')) score += 12
  if (element.getAttribute('aria-label')) score += 10
  if (element.getAttribute('role')) score += 8
  if (element.getAttribute('name')) score += 5

  const rect = element.getBoundingClientRect()
  const centerY = rect.top + rect.height / 2
  const viewportCenter = window.innerHeight / 2
  const distanceFromCenter = Math.abs(centerY - viewportCenter)
  const viewportHeight = window.innerHeight
  if (distanceFromCenter < viewportHeight * 0.3) score += 10
  else if (distanceFromCenter < viewportHeight * 0.5) score += 5

  if (element.textContent?.trim()) score += 5

  const tag = element.tagName.toLowerCase()
  if (['button', 'a', 'input'].includes(tag)) score += 3

  return score
}

export function generateSelectors(element: Element): ElementAnalysis['selectors'] {
  const selectors: ElementAnalysis['selectors'] = []

  if (element.id) {
    selectors.push({ type: 'id', value: `#${element.id}`, confidence: 95 })
  }

  const testId = element.getAttribute('data-testid')
  if (testId) {
    selectors.push({ type: 'testid', value: `[data-testid="${testId}"]`, confidence: 90 })
  }

  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) {
    selectors.push({ type: 'aria', value: `[aria-label="${ariaLabel}"]`, confidence: 85 })
  }

  const name = element.getAttribute('name')
  if (name) {
    selectors.push({ type: 'name', value: `[name="${name}"]`, confidence: 80 })
  }

  const text = element.textContent?.trim()
  if (text && text.length < 50 && ['button', 'a'].includes(element.tagName.toLowerCase())) {
    selectors.push({
      type: 'text',
      value: `${element.tagName.toLowerCase()}:has-text("${text.slice(0, 30)}")`,
      confidence: 70,
    })
  }

  const structural = generateStructuralSelector(element)
  selectors.push({ type: 'structural', value: structural, confidence: 40 })

  return selectors
}

function generateStructuralSelector(element: Element): string {
  const path: string[] = []
  let current: Element | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      path.unshift(`#${current.id}`)
      break
    }

    const className = current.className
    if (className && typeof className === 'string') {
      const classes = className
        .split(' ')
        .filter((c) => c && !c.includes(':'))
        .slice(0, 2)
      if (classes.length > 0) {
        selector += '.' + classes.join('.')
      }
    }

    const siblings = current.parentElement?.children
    if (siblings && siblings.length > 1) {
      const index = Array.from(siblings).indexOf(current) + 1
      selector += `:nth-child(${index})`
    }

    path.unshift(selector)
    current = current.parentElement
  }

  return path.join(' > ')
}

export function analyzeElement(element: Element): ElementAnalysis {
  const selectors = generateSelectors(element)
  const recommended = selectors.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  ).value

  const rect = element.getBoundingClientRect()

  return {
    selectors,
    recommended,
    isVisible: isVisible(element),
    isInteractive: isInteractive(element),
    priority: calculatePriorityScore(element),
    boundingBox: {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  }
}
