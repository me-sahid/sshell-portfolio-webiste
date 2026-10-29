export interface ThemeDefinition {
  id: string
  name: string
  description: string
  colors: {
    bgMain: string
    termSurface: string
    termHeader: string
    promptGreen: string
    commandCyan: string
    textPrimary: string
    textSecondary: string
    termBorder: string
  }
}

export const THEMES: Record<string, ThemeDefinition> = {
  default: {
    id: 'default',
    name: 'Default (GitHub Dark)',
    description: 'Clean classic dark Linux terminal',
    colors: {
      bgMain: '#0D1117',
      termSurface: '#15181E',
      termHeader: '#161B22',
      promptGreen: '#7EE787',
      commandCyan: '#79C0FF',
      textPrimary: '#E6EDF3',
      textSecondary: '#8B949E',
      termBorder: '#30363D',
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    description: 'Phosphor green cyberpunk terminal',
    colors: {
      bgMain: '#030A04',
      termSurface: '#061308',
      termHeader: '#091C0C',
      promptGreen: '#00FF66',
      commandCyan: '#33FF99',
      textPrimary: '#80FFB2',
      textSecondary: '#297341',
      termBorder: '#004D1A',
    },
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    description: 'Famous dark theme with vibrant accents',
    colors: {
      bgMain: '#1E1F29',
      termSurface: '#282A36',
      termHeader: '#21222C',
      promptGreen: '#50FA7B',
      commandCyan: '#8BE9FD',
      textPrimary: '#F8F8F2',
      textSecondary: '#6272A4',
      termBorder: '#44475A',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic, north-bluish clean palette',
    colors: {
      bgMain: '#242933',
      termSurface: '#2E3440',
      termHeader: '#2B303C',
      promptGreen: '#A3BE8C',
      commandCyan: '#88C0D0',
      textPrimary: '#ECEFF4',
      textSecondary: '#9CA6B8',
      termBorder: '#434C5E',
    },
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Retro groove warm dark palette',
    colors: {
      bgMain: '#1D2021',
      termSurface: '#282828',
      termHeader: '#1E2021',
      promptGreen: '#B8BB26',
      commandCyan: '#83A598',
      textPrimary: '#EBDBB2',
      textSecondary: '#928374',
      termBorder: '#504945',
    },
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Neon nightlife in downtown Tokyo',
    colors: {
      bgMain: '#16161E',
      termSurface: '#1A1B26',
      termHeader: '#1F202E',
      promptGreen: '#73DACA',
      commandCyan: '#7AA2F7',
      textPrimary: '#C0CAF5',
      textSecondary: '#565F89',
      termBorder: '#292E42',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk',
    description: 'High-contrast neon cyberspace',
    colors: {
      bgMain: '#0A0012',
      termSurface: '#120021',
      termHeader: '#1B0030',
      promptGreen: '#00F0FF',
      commandCyan: '#FF0055',
      textPrimary: '#FEE715',
      textSecondary: '#9D00FF',
      termBorder: '#FF007F',
    },
  },
}
