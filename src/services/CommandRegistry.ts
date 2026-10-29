import type { CommandExecutionResult } from '../data/types'
import {
  IDENTITY,
  EDUCATION,
  SKILLS,
  PROJECTS,
  ACHIEVEMENTS,
  WELCOME_TEXT,
  ASCII_BANNER,
  ASCII_NEOFETCH_LOGO,
} from '../data/portfolioData'
import { VirtualFileSystem } from './VirtualFileSystem'
import type { ParsedCommand } from './CommandParser'

export interface CommandDefinition {
  name: string
  description: string
  usage: string
  allowedFlags?: string[]
  handler: (parsed: ParsedCommand, context: CommandContext) => CommandExecutionResult
}

export interface CommandContext {
  vfs: VirtualFileSystem
  history: string[]
  onSwitchView?: (view: string) => void
  onClear?: () => void
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map()

  constructor() {
    this.registerDefaults()
  }

  public register(cmd: CommandDefinition) {
    this.commands.set(cmd.name.toLowerCase(), cmd)
  }

  public getCommands(): CommandDefinition[] {
    return Array.from(this.commands.values())
  }

  public getCommandNames(): string[] {
    return Array.from(this.commands.keys())
  }

  public findSuggestion(unknownCmd: string): string | null {
    let closest: string | null = null
    let minDistance = 3 // Only suggest if within 2 edits

    for (const name of this.commands.keys()) {
      const dist = levenshteinDistance(unknownCmd.toLowerCase(), name)
      if (dist < minDistance) {
        minDistance = dist
        closest = name
      }
    }
    return closest
  }

  public execute(parsed: ParsedCommand, context: CommandContext): CommandExecutionResult {
    try {
      if (parsed.hasChainError) {
        return {
          success: false,
          output: parsed.chainErrorMessage || 'bash: command chaining not supported',
        }
      }

      if (!parsed.command) {
        return { success: true, output: '' }
      }

      const def = this.commands.get(parsed.command)
      if (!def) {
        const suggestion = this.findSuggestion(parsed.command)
        let msg = `bash: ${parsed.command}: command not found`
        if (suggestion) {
          msg += `\nDid you mean '${suggestion}'?`
        }
        msg += "\nTry 'help' to see available commands."
        return {
          success: false,
          output: msg,
        }
      }

      // Check for disallowed flags
      if (parsed.flags.length > 0) {
        const allowed = def.allowedFlags || []
        for (const flag of parsed.flags) {
          if (!allowed.includes(flag)) {
            return {
              success: false,
              output: `${def.name}: invalid option '${flag}'\nusage: ${def.usage}`,
            }
          }
        }
      }

      return def.handler(parsed, context)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        output: `Error executing '${parsed.command}': ${errorMsg}`,
      }
    }
  }

  private registerDefaults() {
    // welcome
    this.register({
      name: 'welcome',
      description: 'Display introduction and background overview',
      usage: 'welcome',
      handler: () => {
        return { success: true, output: WELCOME_TEXT }
      },
    })

    // help
    this.register({
      name: 'help',
      description: 'Show available commands or help for a specific command',
      usage: 'help [command]',
      handler: (parsed) => {
        if (parsed.args.length > 0) {
          const target = parsed.args[0].toLowerCase()
          const cmd = this.commands.get(target)
          if (!cmd) {
            return {
              success: false,
              output: `help: no help topics match '${target}'. Try 'help' for available commands.`,
            }
          }
          return {
            success: true,
            output: `${cmd.name} - ${cmd.description}\nUsage: ${cmd.usage}`,
          }
        }

        const lines = [
          'Available commands:',
          '',
          ...this.getCommands().map(
            (c) => `${c.name.padEnd(14)} ${c.description}`
          ),
          '',
          'Tip: Type a command above. Use ↑ / ↓ for history, Tab for autocompletion.',
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // whoami
    this.register({
      name: 'whoami',
      description: 'Display my identity',
      usage: 'whoami',
      handler: () => {
        const text = `${IDENTITY.name}\n${IDENTITY.shortIdentity}\nFocus: ${IDENTITY.focus}`
        return { success: true, output: text }
      },
    })

    // about
    this.register({
      name: 'about',
      description: 'Learn about my background, education, and interests',
      usage: 'about',
      handler: () => {
        const output = [
          `=== ${IDENTITY.name} ===`,
          IDENTITY.shortIdentity,
          '',
          `Focus: ${IDENTITY.focus}`,
          '',
          'Currently pursuing Bachelor of Technology in Computer Science and Engineering at Chaitanya Deemed to be University, Hyderabad (CGPA: 9.38).',
          'Previously completed Diploma in Computer Science and Technology at Jakir Hossain Institute of Polytechnic, West Bengal (CGPA: 8.00).',
          '',
          `Email: ${IDENTITY.email}`,
          `LinkedIn: ${IDENTITY.linkedin}`,
          `GitHub: ${IDENTITY.github}`,
        ].join('\n')
        return { success: true, output }
      },
    })

    // projects
    this.register({
      name: 'projects',
      description: 'List my projects',
      usage: 'projects [--all]',
      allowedFlags: ['--all'],
      handler: (parsed) => {
        const showAll = parsed.flags.includes('--all')

        if (showAll) {
          const sections: string[] = []
          PROJECTS.forEach((p) => {
            const lines = [
              `[ ${p.name.toUpperCase()} ]`,
              `Technologies: ${p.technologies.join(', ')}`,
              `Timeline: ${p.dates}`,
            ]
            if (p.website) {
              lines.push(`Website: ${p.website}`)
            }
            lines.push('Key Highlights:')
            p.bullets.forEach((b, idx) => {
              lines.push(`  ${idx + 1}. ${b}`)
            })
            sections.push(lines.join('\n'))
          })
          return { success: true, output: sections.join('\n\n') }
        }

        const lines = [
          'Featured Projects:',
          '',
          ...PROJECTS.map(
            (p) =>
              `  • ${p.name.padEnd(12)} [${p.technologies.slice(0, 3).join(', ')}...] -> ${p.dates}`
          ),
          '',
          "Use 'project <name>' to inspect a specific project (e.g., 'project zancrypt').",
          "Use 'projects --all' to display all project details at once.",
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // project
    this.register({
      name: 'project',
      description: 'Inspect a specific project in detail',
      usage: 'project <name>',
      handler: (parsed) => {
        if (parsed.args.length === 0) {
          return {
            success: false,
            output: `usage: project <name>\nAvailable projects: ${PROJECTS.map((p) => p.id).join(', ')}`,
          }
        }

        const targetId = parsed.args[0].toLowerCase()
        const project = PROJECTS.find(
          (p) => p.id.toLowerCase() === targetId || p.name.toLowerCase() === targetId
        )

        if (!project) {
          return {
            success: false,
            output: `project: ${targetId}: project not found\nRun 'projects' to list available projects.`,
          }
        }

        const lines = [
          `======================================================`,
          `Project: ${project.name}`,
          `Dates:   ${project.dates}`,
          `Stack:   ${project.technologies.join(', ')}`,
        ]
        if (project.website) {
          lines.push(`Website: ${project.website}`)
        }
        lines.push('------------------------------------------------------')
        lines.push('Architecture & Implementation Highlights:')
        project.bullets.forEach((b, i) => {
          lines.push(`${i + 1}. ${b}`)
        })
        lines.push(`======================================================`)

        return { success: true, output: lines.join('\n') }
      },
    })

    // skills
    this.register({
      name: 'skills',
      description: 'Display my technical stack',
      usage: 'skills',
      handler: () => {
        const lines = [
          'TECHNICAL SKILLS',
          '================',
          '',
          'Programming Languages:',
          `  ${SKILLS.programmingLanguages.join('  •  ')}`,
          '',
          'Databases & Caching:',
          `  ${SKILLS.databasesAndCaching.join('  •  ')}`,
          '',
          'Frameworks & Web:',
          `  ${SKILLS.frameworksAndWeb.join('  •  ')}`,
          '',
          'Tools/Technologies:',
          `  ${SKILLS.toolsAndTechnologies.join('  •  ')}`,
          '',
          'Core Concepts:',
          `  ${SKILLS.coreConcepts.join('  •  ')}`,
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // education
    this.register({
      name: 'education',
      description: 'Display my education and CGPA',
      usage: 'education',
      handler: () => {
        const sections: string[] = ['EDUCATION', '=========']
        EDUCATION.forEach((edu, i) => {
          sections.push('')
          sections.push(`${i + 1}. ${edu.institution}`)
          sections.push(`   Degree:   ${edu.degree}`)
          sections.push(`   CGPA:     ${edu.cgpa}`)
          sections.push(`   Location: ${edu.location}`)
          sections.push(`   Timeline: ${edu.dates}`)
        })
        return { success: true, output: sections.join('\n') }
      },
    })

    // achievements
    this.register({
      name: 'achievements',
      description: 'Display hackathons and academic achievements',
      usage: 'achievements',
      handler: () => {
        const lines = [
          'CERTIFICATES / ACHIEVEMENTS',
          '===========================',
          '',
          ...ACHIEVEMENTS.map(
            (item, idx) => `${idx + 1}. ${item.title}:\n   ${item.description}\n`
          ),
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // resume
    this.register({
      name: 'resume',
      description: 'View or download my resume',
      usage: 'resume [--view | --download]',
      allowedFlags: ['--view', '--download'],
      handler: (parsed) => {
        const resumeUrl = '/Sahid_Al_Hassan_Resume.pdf'

        if (parsed.flags.includes('--view')) {
          if (typeof window !== 'undefined') {
            window.open(resumeUrl, '_blank')
          }
          return {
            success: true,
            output: 'Opening resume in a new tab: Sahid_Al_Hassan_Resume.pdf',
            action: 'open_url',
            actionData: resumeUrl,
          }
        }

        if (parsed.flags.includes('--download')) {
          if (typeof window !== 'undefined') {
            const link = document.createElement('a')
            link.href = resumeUrl
            link.download = 'Sahid_Al_Hassan_Resume.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
          return {
            success: true,
            output: 'Downloading verified resume: Sahid_Al_Hassan_Resume.pdf',
            action: 'download_file',
            actionData: resumeUrl,
          }
        }

        const lines = [
          'Resume: Sahid_Al_Hassan_Resume.pdf (Verified asset)',
          '',
          'Options:',
          '  resume --view       Open resume PDF in new tab',
          '  resume --download   Download resume PDF to your device',
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // contact
    this.register({
      name: 'contact',
      description: 'Display contact information',
      usage: 'contact',
      handler: () => {
        const lines = [
          'CONTACT INFORMATION',
          '===================',
          `Name:     ${IDENTITY.name}`,
          `Phone:    ${IDENTITY.phone}`,
          `Email:    ${IDENTITY.email}`,
          `LinkedIn: ${IDENTITY.linkedin}`,
          `GitHub:   ${IDENTITY.github}`,
          `Website:  ${IDENTITY.website}`,
        ]
        return { success: true, output: lines.join('\n') }
      },
    })

    // github
    this.register({
      name: 'github',
      description: 'Open my GitHub profile',
      usage: 'github',
      handler: () => {
        if (typeof window !== 'undefined') {
          window.open(IDENTITY.github, '_blank', 'noopener,noreferrer')
        }
        return {
          success: true,
          output: `Opening GitHub: ${IDENTITY.github}`,
          action: 'open_url',
          actionData: IDENTITY.github,
        }
      },
    })

    // linkedin
    this.register({
      name: 'linkedin',
      description: 'Open my LinkedIn profile',
      usage: 'linkedin',
      handler: () => {
        if (typeof window !== 'undefined') {
          window.open(IDENTITY.linkedin, '_blank', 'noopener,noreferrer')
        }
        return {
          success: true,
          output: `Opening LinkedIn: ${IDENTITY.linkedin}`,
          action: 'open_url',
          actionData: IDENTITY.linkedin,
        }
      },
    })

    // clear
    this.register({
      name: 'clear',
      description: 'Clear terminal output',
      usage: 'clear',
      handler: (parsed) => {
        if (parsed.args.length > 0) {
          return {
            success: false,
            output: 'clear: too many arguments\nusage: clear',
          }
        }
        return {
          success: true,
          output: '',
          clear: true,
        }
      },
    })

    // pwd
    this.register({
      name: 'pwd',
      description: 'Display the virtual working directory',
      usage: 'pwd',
      handler: (_parsed, ctx) => {
        return { success: true, output: ctx.vfs.getPwd() }
      },
    })

    // ls
    this.register({
      name: 'ls',
      description: 'List virtual portfolio files',
      usage: 'ls [path]',
      handler: (parsed, ctx) => {
        const target = parsed.args[0]
        const res = ctx.vfs.ls(target)
        if (!res.success) {
          return { success: false, output: res.error || 'ls error' }
        }
        return { success: true, output: (res.files || []).join('  ') }
      },
    })

    // cd
    this.register({
      name: 'cd',
      description: 'Navigate the virtual directory',
      usage: 'cd [path]',
      handler: (parsed, ctx) => {
        const target = parsed.args[0]
        const res = ctx.vfs.cd(target)
        if (!res.success) {
          return { success: false, output: res.error || 'cd error' }
        }
        return { success: true, output: '', newCwd: ctx.vfs.getPwd() }
      },
    })

    // cat
    this.register({
      name: 'cat',
      description: 'Display a supported portfolio file',
      usage: 'cat <file>',
      handler: (parsed, ctx) => {
        const target = parsed.args[0]
        const res = ctx.vfs.cat(target)
        if (!res.success) {
          return { success: false, output: res.error || 'cat error' }
        }
        return { success: true, output: res.content || '' }
      },
    })

    // history
    this.register({
      name: 'history',
      description: 'Display commands entered in this session',
      usage: 'history',
      handler: (_parsed, ctx) => {
        if (ctx.history.length === 0) {
          return { success: true, output: 'No commands in history yet.' }
        }
        const lines = ctx.history.map((cmd, i) => ` ${String(i + 1).padStart(4)}  ${cmd}`)
        return { success: true, output: lines.join('\n') }
      },
    })

    // date
    this.register({
      name: 'date',
      description: 'Display the current date and time',
      usage: 'date',
      handler: () => {
        const now = new Date()
        return { success: true, output: now.toString() }
      },
    })

    // neofetch
    this.register({
      name: 'neofetch',
      description: 'Display a portfolio summary',
      usage: 'neofetch',
      handler: () => {
        const info = [
          `sahid@portfolio`,
          `---------------`,
          `OS:        Portfolio Linux x86_64 (Simulated)`,
          `Host:      sahid.dev`,
          `Kernel:    Portfolio Shell v1.0`,
          `Uptime:    Active Session`,
          `User:      ${IDENTITY.name}`,
          `Role:      Computer Science Student`,
          `Focus:     Backend | Systems | Security`,
          `College:   Chaitanya Deemed to be University (CGPA: 9.38)`,
          `Poly:      Jakir Hossain Inst. of Poly. (CGPA: 8.00)`,
          `Projects:  Zancrypt, Redis-Lite, AllIDo`,
          `Shell:     portfolio-sh 1.0`,
          `Terminal:  Web PTY`,
        ]

        const logoLines = ASCII_NEOFETCH_LOGO.trim().split('\n')
        const maxLines = Math.max(logoLines.length, info.length)
        const combined: string[] = []

        for (let i = 0; i < maxLines; i++) {
          const logoPart = (logoLines[i] || '').padEnd(32)
          const infoPart = info[i] || ''
          combined.push(`${logoPart} ${infoPart}`)
        }

        return { success: true, output: combined.join('\n') }
      },
    })

    // banner
    this.register({
      name: 'banner',
      description: 'Display a small ASCII wordmark',
      usage: 'banner',
      handler: () => {
        return { success: true, output: ASCII_BANNER.trim() }
      },
    })
  }
}
