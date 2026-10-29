import type { FSEntry } from '../data/types'
import {
  IDENTITY,
  EDUCATION,
  SKILLS,
  PROJECTS,
  ACHIEVEMENTS,
} from '../data/portfolioData'

function generateAboutTxt(): string {
  return `Sahid Al Hassan
${IDENTITY.shortIdentity}
Focus: ${IDENTITY.focus}

Contact & Links:
- Email: ${IDENTITY.email}
- Phone: ${IDENTITY.phone}
- LinkedIn: ${IDENTITY.linkedin}
- GitHub: ${IDENTITY.github}
- Website: ${IDENTITY.website}
`
}

function generateSkillsTxt(): string {
  return `TECHNICAL SKILLS

Programming Languages:
  ${SKILLS.programmingLanguages.join(', ')}

Databases & Caching:
  ${SKILLS.databasesAndCaching.join(', ')}

Frameworks & Web:
  ${SKILLS.frameworksAndWeb.join(', ')}

Tools/Technologies:
  ${SKILLS.toolsAndTechnologies.join(', ')}

Core Concepts:
  ${SKILLS.coreConcepts.join(', ')}
`
}

function generateEducationTxt(): string {
  return `EDUCATION

1. ${EDUCATION[0].institution}
   Location: ${EDUCATION[0].location}
   Degree: ${EDUCATION[0].degree}
   CGPA: ${EDUCATION[0].cgpa}
   Dates: ${EDUCATION[0].dates}

2. ${EDUCATION[1].institution}
   Location: ${EDUCATION[1].location}
   Degree: ${EDUCATION[1].degree}
   CGPA: ${EDUCATION[1].cgpa}
   Dates: ${EDUCATION[1].dates}
`
}

function generateAchievementsTxt(): string {
  return `CERTIFICATES / ACHIEVEMENTS

1. ${ACHIEVEMENTS[0].title}: ${ACHIEVEMENTS[0].description}
2. ${ACHIEVEMENTS[1].title}: ${ACHIEVEMENTS[1].description}
3. ${ACHIEVEMENTS[2].title}: ${ACHIEVEMENTS[2].description}
`
}

function generateProjectTxt(id: string): string {
  const p = PROJECTS.find((proj) => proj.id === id)
  if (!p) return ''
  let text = `Project: ${p.name}\nTechnologies: ${p.technologies.join(', ')}\nDates: ${p.dates}\n`
  if (p.website) {
    text += `Website: ${p.website}\n`
  }
  text += '\nOverview:\n'
  p.bullets.forEach((b, idx) => {
    text += `${idx + 1}. ${b}\n`
  })
  return text
}

export class VirtualFileSystem {
  private root: FSEntry
  private currentPath: string[] = ['home', 'sahid', 'portfolio']

  constructor() {
    this.root = {
      name: '/',
      type: 'directory',
      children: {
        home: {
          name: 'home',
          type: 'directory',
          children: {
            sahid: {
              name: 'sahid',
              type: 'directory',
              children: {
                portfolio: {
                  name: 'portfolio',
                  type: 'directory',
                  children: {
                    'about.txt': {
                      name: 'about.txt',
                      type: 'file',
                      content: generateAboutTxt(),
                    },
                    'skills.txt': {
                      name: 'skills.txt',
                      type: 'file',
                      content: generateSkillsTxt(),
                    },
                    'education.txt': {
                      name: 'education.txt',
                      type: 'file',
                      content: generateEducationTxt(),
                    },
                    'achievements.txt': {
                      name: 'achievements.txt',
                      type: 'file',
                      content: generateAchievementsTxt(),
                    },
                    projects: {
                      name: 'projects',
                      type: 'directory',
                      children: {
                        'zancrypt.txt': {
                          name: 'zancrypt.txt',
                          type: 'file',
                          content: generateProjectTxt('zancrypt'),
                        },
                        'redis-lite.txt': {
                          name: 'redis-lite.txt',
                          type: 'file',
                          content: generateProjectTxt('redis-lite'),
                        },
                        'allido.txt': {
                          name: 'allido.txt',
                          type: 'file',
                          content: generateProjectTxt('allido'),
                        },
                      },
                    },
                    resume: {
                      name: 'resume',
                      type: 'directory',
                      children: {
                        'Sahid_Al_Hassan_Resume.pdf': {
                          name: 'Sahid_Al_Hassan_Resume.pdf',
                          type: 'file',
                          isBinary: true,
                          downloadUrl: '/Sahid_Al_Hassan_Resume.pdf',
                          content: '[Binary PDF File - Use "resume --view" or "resume --download" to access]',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  }

  public getPwd(): string {
    return '/' + this.currentPath.join('/')
  }

  public getPromptPath(): string {
    const full = this.getPwd()
    const home = '/home/sahid/portfolio'
    if (full === home) {
      return '~'
    }
    if (full.startsWith(home + '/')) {
      return '~' + full.substring(home.length)
    }
    return full
  }

  private resolvePath(pathStr: string): string[] {
    let parts: string[]
    let startingParts: string[]

    const trimmed = pathStr.trim()
    if (trimmed === '~' || trimmed === '') {
      return ['home', 'sahid', 'portfolio']
    } else if (trimmed.startsWith('~/')) {
      startingParts = ['home', 'sahid', 'portfolio']
      parts = trimmed.substring(2).split('/').filter(Boolean)
    } else if (trimmed.startsWith('/')) {
      startingParts = []
      parts = trimmed.split('/').filter(Boolean)
    } else {
      startingParts = [...this.currentPath]
      parts = trimmed.split('/').filter(Boolean)
    }

    const resolved = [...startingParts]
    for (const part of parts) {
      if (part === '.') {
        continue
      } else if (part === '..') {
        if (resolved.length > 0) {
          resolved.pop()
        }
      } else {
        resolved.push(part)
      }
    }
    return resolved
  }

  private getNode(pathParts: string[]): FSEntry | null {
    let curr = this.root
    for (const part of pathParts) {
      if (curr.type !== 'directory' || !curr.children) {
        return null
      }
      if (!curr.children[part]) {
        return null
      }
      curr = curr.children[part]
    }
    return curr
  }

  public cd(targetPath?: string): { success: boolean; error?: string } {
    if (!targetPath || targetPath === '~') {
      this.currentPath = ['home', 'sahid', 'portfolio']
      return { success: true }
    }

    const resolved = this.resolvePath(targetPath)
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `cd: ${targetPath}: No such file or directory` }
    }

    if (node.type !== 'directory') {
      return { success: false, error: `cd: ${targetPath}: Not a directory` }
    }

    this.currentPath = resolved
    return { success: true }
  }

  public ls(targetPath?: string): { success: boolean; files?: string[]; error?: string } {
    const resolved = targetPath ? this.resolvePath(targetPath) : this.currentPath
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `ls: cannot access '${targetPath}': No such file or directory` }
    }

    if (node.type === 'file') {
      return { success: true, files: [node.name] }
    }

    const items = Object.values(node.children || {}).map((child) => {
      return child.type === 'directory' ? `${child.name}/` : child.name
    })

    return { success: true, files: items.sort() }
  }

  public cat(filePath: string): { success: boolean; content?: string; isBinary?: boolean; downloadUrl?: string; error?: string } {
    if (!filePath) {
      return { success: false, error: 'cat: missing operand\nTry \'help\' or \'ls\' for available files.' }
    }

    const resolved = this.resolvePath(filePath)
    const node = this.getNode(resolved)

    if (!node) {
      return { success: false, error: `cat: ${filePath}: No such file or directory` }
    }

    if (node.type === 'directory') {
      return { success: false, error: `cat: ${filePath}: Is a directory` }
    }

    return {
      success: true,
      content: node.content,
      isBinary: node.isBinary,
      downloadUrl: node.downloadUrl,
    }
  }

  public getCompletions(currentWord: string): string[] {
    const lastSlashIndex = currentWord.lastIndexOf('/')
    let dirPath = ''
    let prefix = currentWord

    if (lastSlashIndex !== -1) {
      dirPath = currentWord.substring(0, lastSlashIndex + 1)
      prefix = currentWord.substring(lastSlashIndex + 1)
    }

    const resolved = this.resolvePath(dirPath || '.')
    const node = this.getNode(resolved)

    if (!node || node.type !== 'directory' || !node.children) {
      return []
    }

    const matches: string[] = []
    for (const name of Object.keys(node.children)) {
      if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
        const isDir = node.children[name].type === 'directory'
        matches.push(dirPath + name + (isDir ? '/' : ''))
      }
    }
    return matches
  }
}
