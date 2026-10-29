export interface ParsedCommand {
  raw: string
  command: string
  args: string[]
  flags: string[]
  hasChainError: boolean
  chainErrorMessage?: string
}

export class CommandParser {
  public static parse(input: string): ParsedCommand {
    const raw = input.trim()

    if (!raw) {
      return {
        raw: '',
        command: '',
        args: [],
        flags: [],
        hasChainError: false,
      }
    }

    // Check for command chaining characters outside of quotes
    if (this.containsChaining(raw)) {
      return {
        raw,
        command: '',
        args: [],
        flags: [],
        hasChainError: true,
        chainErrorMessage: 'bash: syntax error: command chaining (;, &&, ||, |) is not supported in this simulated shell',
      }
    }

    const tokens = this.tokenize(raw)
    const command = (tokens[0] || '').toLowerCase()
    const rawArgs = tokens.slice(1)

    const args: string[] = []
    const flags: string[] = []

    for (const item of rawArgs) {
      if (item.startsWith('-')) {
        flags.push(item)
      } else {
        args.push(item)
      }
    }

    return {
      raw,
      command,
      args,
      flags,
      hasChainError: false,
    }
  }

  private static containsChaining(str: string): boolean {
    let inSingle = false
    let inDouble = false

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if (char === "'" && !inDouble) {
        inSingle = !inSingle
      } else if (char === '"' && !inSingle) {
        inDouble = !inDouble
      } else if (!inSingle && !inDouble) {
        if (
          char === ';' ||
          char === '|' ||
          (char === '&' && str[i + 1] === '&')
        ) {
          return true
        }
      }
    }
    return false
  }

  private static tokenize(str: string): string[] {
    const tokens: string[] = []
    let current = ''
    let inSingle = false
    let inDouble = false

    for (let i = 0; i < str.length; i++) {
      const char = str[i]

      if (char === "'" && !inDouble) {
        inSingle = !inSingle
      } else if (char === '"' && !inSingle) {
        inDouble = !inDouble
      } else if (/\s/.test(char) && !inSingle && !inDouble) {
        if (current.length > 0) {
          tokens.push(current)
          current = ''
        }
      } else {
        current += char
      }
    }

    if (current.length > 0) {
      tokens.push(current)
    }

    return tokens
  }
}

