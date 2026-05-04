import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  palette: {
    "primary": {
      "main": "#aa1111"
    },
    "secondary": {
      "main": "#387799"
    },
    "background": {
      "default": "#281818",
      "paper": "#281818"
    },
    "info": {
      "main": "#02d1be"
    },
    "success": {
      "main": "#44c047"
    },
    "mode":"dark"
  },
  "typography": {
    "fontFamily": "Cormorant Unicase",
    "fontWeightLight": 500,
    "fontWeightRegular": 600,
    "fontWeightMedium": 700,
    "fontWeightBold": 900,
    "body1": {
      fontSize: "1.2rem"
    }
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