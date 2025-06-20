import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    tabBar: string;
    tabBarActive: string;
    tabBarInactive: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
    };
    caption: {
      fontSize: number;
    };
    small: {
      fontSize: number;
    };
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const darkTheme = {
  colors: {
    primary: '#FF0000',
    secondary: '#FF4D4D',
    background: '#0A0A0A',
    surface: '#171717',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 0, 0, 0.15)',
    tabBar: '#171717',
    tabBarActive: '#FF0000',
    tabBarInactive: 'rgba(255, 255, 255, 0.5)',
    error: '#FF4D4D',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
    small: {
      fontSize: 14,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const lightTheme = {
  colors: {
    primary: '#FF0000',
    secondary: '#FF4D4D',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    border: 'rgba(255, 0, 0, 0.15)',
    tabBar: '#FFFFFF',
    tabBarActive: '#FF0000',
    tabBarInactive: 'rgba(0, 0, 0, 0.5)',
    error: '#FF4D4D',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
    small: {
      fontSize: 14,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
}; 