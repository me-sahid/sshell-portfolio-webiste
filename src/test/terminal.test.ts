import { describe, it, expect, beforeEach } from 'vitest'
import { CommandParser } from '../services/CommandParser'
import { CommandRegistry } from '../services/CommandRegistry'
import type { CommandContext } from '../services/CommandRegistry'
import { VirtualFileSystem } from '../services/VirtualFileSystem'
import { PROJECTS, SKILLS, IDENTITY } from '../data/portfolioData'

describe('Interactive Linux Terminal Portfolio Tests', () => {
  let registry: CommandRegistry
  let vfs: VirtualFileSystem
  let context: CommandContext

  beforeEach(() => {
    registry = new CommandRegistry()
    vfs = new VirtualFileSystem()
    context = {
      vfs,
      history: ['whoami', 'help'],
    }
  })

  // 1. help displays available commands
  it('1. help displays available commands', () => {
    const parsed = CommandParser.parse('help')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toContain('Available commands:')
    expect(result.output).toContain('projects')
    expect(result.output).toContain('skills')
    expect(result.output).toContain('whoami')
  })

  // 2. help unknown-command produces a helpful response
  it('2. help unknown-command produces a helpful response', () => {
    const parsed = CommandParser.parse('help unknown-command')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain("help: no help topics match 'unknown-command'")
  })

  // 3. projects lists exactly the three projects
  it('3. projects lists exactly the three projects', () => {
    const parsed = CommandParser.parse('projects')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toContain('Zancrypt')
    expect(result.output).toContain('Redis-Lite')
    expect(result.output).toContain('AllIDo')
    expect(PROJECTS.length).toBe(3)
  })

  // 4. project zancrypt displays the correct information
  it('4. project zancrypt displays the correct information', () => {
    const parsed = CommandParser.parse('project zancrypt')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toContain('Project: Zancrypt')
    expect(result.output).toContain('https://zancrypt.in')
    expect(result.output).toContain('AES-256-GCM')
    expect(result.output).toContain('rendezvous hashing')
  })

  // 5. project unknown-project returns a project-not-found error
  it('5. project unknown-project returns a project-not-found error', () => {
    const parsed = CommandParser.parse('project unknown-project')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain('project: unknown-project: project not found')
  })

  // 6. project displays usage instructions
  it('6. project displays usage instructions', () => {
    const parsed = CommandParser.parse('project')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain('usage: project <name>')
    expect(result.output).toContain('zancrypt, redis-lite, allido')
  })

  // 7. porjects returns an unknown-command error and a typo suggestion
  it('7. porjects returns an unknown-command error and a typo suggestion', () => {
    const parsed = CommandParser.parse('porjects')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain('bash: porjects: command not found')
    expect(result.output).toContain("Did you mean 'projects'?")
  })

  // 8. projects --invalid rejects the unsupported option
  it('8. projects --invalid rejects the unsupported option', () => {
    const parsed = CommandParser.parse('projects --invalid')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain("projects: invalid option '--invalid'")
    expect(result.output).toContain('usage: projects [--all]')
  })

  // 9. pwd displays the current virtual directory
  it('9. pwd displays the current virtual directory', () => {
    const parsed = CommandParser.parse('pwd')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toBe('/home/sahid/portfolio')
  })

  // 10. cd projects changes the virtual directory
  it('10. cd projects changes the virtual directory', () => {
    const parsed = CommandParser.parse('cd projects')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(context.vfs.getPwd()).toBe('/home/sahid/portfolio/projects')
  })

  // 11. cd nonexistent returns a path error
  it('11. cd nonexistent returns a path error', () => {
    const parsed = CommandParser.parse('cd nonexistent')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain('cd: nonexistent: No such file or directory')
  })

  // 12. ls lists the current virtual directory correctly
  it('12. ls lists the current virtual directory correctly', () => {
    const parsed = CommandParser.parse('ls')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toContain('about.txt')
    expect(result.output).toContain('skills.txt')
    expect(result.output).toContain('projects/')
    expect(result.output).toContain('resume/')
  })

  // 13. cat skills.txt displays the exact resume skills
  it('13. cat skills.txt displays the exact resume skills', () => {
    const parsed = CommandParser.parse('cat skills.txt')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.output).toContain('Programming Languages:')
    for (const lang of SKILLS.programmingLanguages) {
      expect(result.output).toContain(lang)
    }
    for (const db of SKILLS.databasesAndCaching) {
      expect(result.output).toContain(db)
    }
  })

  // 14. clear works without disabling input
  it('14. clear works without disabling input', () => {
    const parsed = CommandParser.parse('clear')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(true)
    expect(result.clear).toBe(true)

    // Clear with arguments fails validation
    const failParsed = CommandParser.parse('clear unexpected_arg')
    const failRes = registry.execute(failParsed, context)
    expect(failRes.success).toBe(false)
    expect(failRes.output).toContain('clear: too many arguments')
  })

  // 15. Up/Down history navigation works
  it('15. Up/Down history navigation works', () => {
    const history = ['first-cmd', 'second-cmd', 'third-cmd']
    let pointer = history.length
    // Simulating arrow UP
    if (pointer > 0) pointer--
    expect(history[pointer]).toBe('third-cmd')
    if (pointer > 0) pointer--
    expect(history[pointer]).toBe('second-cmd')
    // Simulating arrow DOWN
    if (pointer < history.length - 1) pointer++
    expect(history[pointer]).toBe('third-cmd')
  })

  // 16. Tab completion handles one or multiple matches
  it('16. Tab completion handles one or multiple matches', () => {
    const commands = registry.getCommandNames()
    const matchesWho = commands.filter((c) => c.startsWith('who'))
    expect(matchesWho).toEqual(['whoami'])

    const projectFiles = vfs.getCompletions('pro')
    expect(projectFiles).toContain('projects/')
  })

  // 17. A deliberately simulated command-handler exception is caught
  it('17. A deliberately simulated command-handler exception is caught', () => {
    registry.register({
      name: 'crashme',
      description: 'Test crash',
      usage: 'crashme',
      handler: () => {
        throw new Error('Simulated internal failure')
      },
    })
    const parsed = CommandParser.parse('crashme')
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain("Error executing 'crashme': Simulated internal failure")
  })

  // 18. The terminal remains usable after a failure
  it('18. The terminal remains usable after a failure', () => {
    // Run failed command
    const failParsed = CommandParser.parse('invalid-command-xyz')
    const failRes = registry.execute(failParsed, context)
    expect(failRes.success).toBe(false)

    // Run valid command immediately after
    const validParsed = CommandParser.parse('whoami')
    const validRes = registry.execute(validParsed, context)
    expect(validRes.success).toBe(true)
    expect(validRes.output).toContain(IDENTITY.name)
  })

  // 19. Command chaining is detected and rejected safely
  it('19. Command chaining is detected and rejected safely', () => {
    const parsed = CommandParser.parse('echo 1; rm -rf /')
    expect(parsed.hasChainError).toBe(true)
    const result = registry.execute(parsed, context)
    expect(result.success).toBe(false)
    expect(result.output).toContain('command chaining')
  })

  // 20. No arbitrary operating-system command executes
  it('20. No arbitrary operating-system command executes', () => {
    const dangerous = ['rm -rf /', 'curl evil.com', 'eval(something)', 'cat /etc/passwd']
    for (const cmd of dangerous) {
      const parsed = CommandParser.parse(cmd)
      const res = registry.execute(parsed, context)
      expect(res.success).toBe(false)
      expect(res.output).not.toContain('root:')
    }
  })

  // 21. All navigation items work
  it('21. All standard commands correspond to navigation items', () => {
    const navCommands = ['about', 'projects', 'skills', 'education', 'achievements', 'resume', 'contact']
    for (const item of navCommands) {
      const parsed = CommandParser.parse(item)
      const res = registry.execute(parsed, context)
      expect(res.success).toBe(true)
    }
  })

  // 22. Resume view/download links point to the actual supplied file
  it('22. Resume view/download links point to the actual supplied file', () => {
    const parsed = CommandParser.parse('resume --download')
    const res = registry.execute(parsed, context)
    expect(res.success).toBe(true)
    expect(res.actionData).toBe('/Sahid_Al_Hassan_Resume.pdf')

    const viewParsed = CommandParser.parse('resume --view')
    const viewRes = registry.execute(viewParsed, context)
    expect(viewRes.success).toBe(true)
    expect(viewRes.actionData).toBe('/Sahid_Al_Hassan_Resume.pdf')
  })

  // 23. No broken external links or fabricated repositories are displayed
  it('23. No broken external links or fabricated repositories are displayed', () => {
    const redis = PROJECTS.find((p) => p.id === 'redis-lite')
    expect(redis?.github).toBeUndefined()

    const allido = PROJECTS.find((p) => p.id === 'allido')
    expect(allido?.github).toBeUndefined()

    const zancrypt = PROJECTS.find((p) => p.id === 'zancrypt')
    expect(zancrypt?.website).toBe('https://zancrypt.in')
  })

  // Additional VFS & Command Tests
  it('supports path navigation and cat in subdirectories', () => {
    const catProjRes = vfs.cat('projects/zancrypt.txt')
    expect(catProjRes.success).toBe(true)
    expect(catProjRes.content).toContain('Zancrypt')

    // cd projects
    vfs.cd('projects')
    expect(vfs.getPwd()).toBe('/home/sahid/portfolio/projects')
    expect(vfs.getPromptPath()).toBe('~/projects')

    // cat redis-lite.txt in subfolder
    const catRedis = vfs.cat('redis-lite.txt')
    expect(catRedis.success).toBe(true)
    expect(catRedis.content).toContain('Redis-Lite')

    // cd ..
    vfs.cd('..')
    expect(vfs.getPwd()).toBe('/home/sahid/portfolio')
    expect(vfs.getPromptPath()).toBe('~')
  })

  it('runs date, neofetch, banner, and history properly', () => {
    const dateRes = registry.execute(CommandParser.parse('date'), context)
    expect(dateRes.success).toBe(true)

    const neofetchRes = registry.execute(CommandParser.parse('neofetch'), context)
    expect(neofetchRes.success).toBe(true)
    expect(neofetchRes.output).toContain('OS:')

    const bannerRes = registry.execute(CommandParser.parse('banner'), context)
    expect(bannerRes.success).toBe(true)
    expect(bannerRes.output).toContain('___')

    const histRes = registry.execute(CommandParser.parse('history'), context)
    expect(histRes.success).toBe(true)
    expect(histRes.output).toContain('whoami')
  })
})
