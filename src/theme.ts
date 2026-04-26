import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

export const dark: ThemeOptions = {
  palette: {
    primary: {
      main: '#c478e0',
    },
    secondary: {
      main: '#3544b1',
    },
    info: {
      main: '#00acc1',
    },
    divider: '#512da8',
    background: {
      default: '#05060f',
      paper: '#05060f',
    },
  },
  typography: {
    fontFamily: 'Livvic',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.75rem',
    },
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 900,
  },
};

export const light: ThemeOptions = {
  palette: {
    primary: {
      main: '#8338a8',
    },
    secondary: {
      main: '#2537d2',
    },
    info: {
      main: '#00acc1',
    },
    divider: '#512da8',
    mode: 'light',
    background: {
      default: '#f2f7fc',
      paper: '#f2f7fc',
    },
  },
  typography: {
    fontFamily: 'Livvic',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.75rem',
    },
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 900,
  },
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  colorSchemes: {
    light: light,
    dark: dark,
  },
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  }
});

export default theme