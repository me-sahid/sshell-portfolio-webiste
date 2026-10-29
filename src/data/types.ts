export interface Identity {
  name: string
  shortIdentity: string
  focus: string
  phone: string
  email: string
  linkedin: string
  github: string
  website: string
}

export interface EducationItem {
  institution: string
  location: string
  degree: string
  cgpa: string
  dates: string
}

export interface TechnicalSkills {
  programmingLanguages: string[]
  databasesAndCaching: string[]
  frameworksAndWeb: string[]
  toolsAndTechnologies: string[]
  coreConcepts: string[]
}

export interface ProjectItem {
  id: string
  name: string
  technologies: string[]
  dates: string
  website?: string
  github?: string
  bullets: string[]
}

export interface AchievementItem {
  id: string
  title: string
  description: string
}

export type OutputType = 'input' | 'output' | 'error' | 'system'

export interface TerminalEntry {
  id: string
  type: OutputType
  command?: string
  cwd?: string
  content: string | React.ReactNode
  timestamp: number
}

export interface CommandExecutionResult {
  success: boolean
  output: string | React.ReactNode
  clear?: boolean
  newCwd?: string
  action?: 'open_url' | 'download_file' | 'switch_view'
  actionData?: string
}

export interface FSEntry {
  name: string
  type: 'file' | 'directory'
  content?: string
  isBinary?: boolean
  downloadUrl?: string
  children?: { [name: string]: FSEntry }
}
