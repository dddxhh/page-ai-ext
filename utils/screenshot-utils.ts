export async function captureElementScreenshot(
  element: Element,
  highlight: boolean = true
): Promise<string | null> {
  try {
    if (highlight) {
      const originalOutline = element.getAttribute('style') || ''
      element.setAttribute(
        'style',
        originalOutline + '; outline: 3px solid red !important; outline-offset: 2px;'
      )

      await new Promise((resolve) => setTimeout(resolve, 100))

      setTimeout(() => {
        element.setAttribute('style', originalOutline)
      }, 500)
    }

    return null
  } catch (error) {
    console.error('Failed to capture element screenshot:', error)
    return null
  }
}

export function getElementPreviewInfo(element: Element): string {
  const rect = element.getBoundingClientRect()
  const text = element.textContent?.slice(0, 50) || ''
  const tag = element.tagName.toLowerCase()

  return JSON.stringify({
    tag,
    text,
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  })
}
