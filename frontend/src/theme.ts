import { createTheme } from '@mui/material/styles';

export const THEME_PALETTES: {
  [key: string]: {
    primary: string;
    secondary: string;
    background: string;
    paper: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    info: string;
    warning: string;
    error: string;
  };
} = {
  default: {
    primary: '#FF0000',
    secondary: '#171717',
    background: '#0A0A0A',
    paper: '#171717',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,0,0,0.15)',
    success: '#FF0000',
    info: '#FF0000',
    warning: '#FF0000',
    error: '#FF4444',
  },
  space: {
    primary: '#00F5FF',
    secondary: '#0A2233',
    background: '#0A0A1A',
    paper: '#112244',
    text: '#FFFFFF',
    textSecondary: 'rgba(200,255,255,0.7)',
    border: 'rgba(0,245,255,0.15)',
    success: '#00F5FF',
    info: '#00F5FF',
    warning: '#00F5FF',
    error: '#FF4444',
  },
  sunset: {
    primary: '#FF6B6B',
    secondary: '#FFD93D',
    background: '#1A0A0A',
    paper: '#442211',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,230,200,0.7)',
    border: 'rgba(255,107,107,0.15)',
    success: '#FFD93D',
    info: '#FFD93D',
    warning: '#FFD93D',
    error: '#FF6B6B',
  },
  neon: {
    primary: '#00FF00',
    secondary: '#171717',
    background: '#0A0A0A',
    paper: '#0A0A0A',
    text: '#FFFFFF',
    textSecondary: 'rgba(200,255,200,0.7)',
    border: 'rgba(0,255,0,0.15)',
    success: '#00FF00',
    info: '#00FF00',
    warning: '#00FF00',
    error: '#FF4444',
  },
  ocean: {
    primary: '#64FFDA',
    secondary: '#00B4D8',
    background: '#0A1A1A',
    paper: '#112244',
    text: '#FFFFFF',
    textSecondary: 'rgba(100,255,218,0.7)',
    border: 'rgba(100,255,218,0.15)',
    success: '#64FFDA',
    info: '#64FFDA',
    warning: '#64FFDA',
    error: '#FF4444',
  },
  purple: {
    primary: '#a18cd1',
    secondary: '#fbc2eb',
    background: '#1A1A1A',
    paper: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(161,140,209,0.15)',
    success: '#a18cd1',
    info: '#a18cd1',
    warning: '#a18cd1',
    error: '#FF4444',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#232526',
    background: '#232526',
    paper: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,215,0,0.15)',
    success: '#FFD700',
    info: '#FFD700',
    warning: '#FFD700',
    error: '#FF4444',
  },
};

export const getMuiTheme = (themeKey: string) => {
  const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.default;
  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: palette.primary },
      secondary: { main: palette.secondary },
      background: { default: palette.background, paper: palette.paper },
      text: { primary: palette.text, secondary: palette.textSecondary },
      error: { main: palette.error },
      warning: { main: palette.warning },
      info: { main: palette.info },
      success: { main: palette.success },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            background: `linear-gradient(45deg, ${palette.primary} 30%, ${palette.secondary} 90%)`,
            color: '#fff',
            '&:hover': {
              background: `linear-gradient(45deg, ${palette.primary} 10%, ${palette.secondary} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: palette.paper,
            border: `1px solid ${palette.border}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.paper,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.paper,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:hover': {
              backgroundColor: palette.primary + '22',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            background: palette.primary + '22',
            color: palette.primary,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              borderColor: palette.primary,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background,
            color: palette.text,
          },
        },
      },
    },
  });
}; 