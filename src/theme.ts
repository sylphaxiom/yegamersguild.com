import type { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

export const dark: ThemeOptions = {
  palette: {
        primary: { main: "#aa1111" },
        secondary: { main: "#578eac" },
        background: { default: "#3a2020", paper: "#3a2020" },
        info: { main: "#02d1be" },
        success: { main: "#44c047" },
      }
};

export const light: ThemeOptions = {
  palette: {
        primary: { main: "#aa1111" },
        secondary: { main: "#3d6b85" },
        background: { default: "#f5e6c8", paper: "#fdf3e3" },
        info: { main: "#02d1be" },
        success: { main: "#44c047" },
      }
};

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: { dark, light },
  typography: {
    fontFamily: "EB Garamond",
    fontWeightLight: 500,
    fontWeightRegular: 600,
    fontWeightMedium: 700,
    fontWeightBold: 900,
    h1: { fontFamily: "Cormorant Unicase" },
    h2: { fontFamily: "Cormorant Unicase" },
    h3: { fontFamily: "Cormorant Unicase" },
    h4: { fontFamily: "Cormorant Unicase" },
    h5: { fontFamily: "Cormorant Unicase" },
    h6: { fontFamily: "Cormorant Unicase" },
    subtitle1: { fontFamily: "Cormorant Unicase" },
    subtitle2: { fontFamily: "Cormorant Unicase" },
    body1: { fontSize: "1.2rem" },
  },
  components: {
    MuiUseMediaQuery: {
      defaultProps: { noSsr: true },
    },
  }
});

export default theme;