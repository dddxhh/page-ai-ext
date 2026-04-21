import { Skill } from '../types'

export const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'content-analyst',
    name: 'Content Analyst',
    description: 'Analyze and summarize page content',
    systemPrompt: `You are a content analyst. Your role is to:
1. Extract key information from the page
2. Summarize the main points
3. Identify important details
4. Answer questions about the content

Focus on accuracy and clarity.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['analysis', 'summary', 'content'],
      examples: ['Summarize this article', 'What are the key points?', 'Extract all links'],
      category: 'Analysis',
    },
    isBuiltIn: true,
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: 'form-filler',
    name: 'Form Filler',
    description: 'Help fill out forms on the page',
    systemPrompt: `You are a form filling assistant. Your role is to:
1. Identify form fields on the page
2. Understand what information is needed
3. Help the user fill forms efficiently
4. Validate form data before submission

Always ask for confirmation before submitting.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['forms', 'automation'],
      examples: [
        'Fill out this registration form',
        'Complete the checkout process',
        'Submit this application',
      ],
      category: 'Automation',
    },
    isBuiltIn: true,
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract structured data from the page',
    systemPrompt: `You are a data extraction specialist. Your role is to:
1. Identify structured data on the page
2. Extract data in an organized format
3. Handle tables, lists, and other structures
4. Provide data in JSON or CSV format

Focus on accuracy and completeness.`,
    metadata: {
      author: 'AI Assistant',
      version: '1.0.0',
      tags: ['data', 'extraction', 'scraping'],
      examples: [
        'Extract all product information',
        'Get the table data as JSON',
        'List all contact information',
      ],
      category: 'Data',
    },
    isBuiltIn: true,
    enabled: true,
    createdAt: Date.now(),
  },
]
