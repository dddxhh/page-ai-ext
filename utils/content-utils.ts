export function highlightElement(element: Element): void {
  const originalStyle = element.getAttribute('style')
  element.setAttribute('style', 'outline: 3px solid red !important;')

  setTimeout(() => {
    if (originalStyle) {
      element.setAttribute('style', originalStyle)
    } else {
      element.removeAttribute('style')
    }
  }, 2000)
}

export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message)
    resolve(confirmed)
  })
}

export function convertToMarkdown(element: Element): string {
  let markdown = ''

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()

      switch (tag) {
        case 'h1':
          markdown += `# ${el.textContent}\n\n`
          break
        case 'h2':
          markdown += `## ${el.textContent}\n\n`
          break
        case 'h3':
          markdown += `### ${el.textContent}\n\n`
          break
        case 'p':
          markdown += `${el.textContent}\n\n`
          break
        case 'a':
          markdown += `[${el.textContent}](${el.getAttribute('href')})`
          break
        case 'ul':
          markdown += '\n'
          el.querySelectorAll('li').forEach((li) => {
            markdown += `- ${li.textContent}\n`
          })
          markdown += '\n'
          break
        case 'ol':
          markdown += '\n'
          el.querySelectorAll('li').forEach((li, index) => {
            markdown += `${index + 1}. ${li.textContent}\n`
          })
          markdown += '\n'
          break
        case 'code':
          markdown += `\`${el.textContent}\``
          break
        case 'pre':
          markdown += `\`\`\`\n${el.textContent}\n\`\`\`\n\n`
          break
        case 'strong':
        case 'b':
          markdown += `**${el.textContent}**`
          break
        case 'em':
        case 'i':
          markdown += `*${el.textContent}*`
          break
        default:
          markdown += convertToMarkdown(el)
      }
    }
  })

  return markdown
}

export interface DOMStructureNode {
  tag: string
  id?: string
  className?: string
  text?: string
  children: DOMStructureNode[]
}

export function getDOMStructure(
  element: Element,
  depth: number,
  includeText: boolean,
  currentDepth: number = 0
): DOMStructureNode {
  if (currentDepth >= depth) {
    return {
      tag: element.tagName.toLowerCase(),
      children: [],
      ...(includeText && { text: element.textContent || undefined }),
    }
  }

  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || undefined,
    className: element.className || undefined,
    ...(includeText && { text: element.textContent?.slice(0, 100) }),
    children: Array.from(element.children).map((child) =>
      getDOMStructure(child, depth, includeText, currentDepth + 1)
    ),
  }
}
