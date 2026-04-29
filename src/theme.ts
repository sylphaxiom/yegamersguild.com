import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

export const dark: ThemeOptions = {
  "palette": {
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
  },
  "typography": {
    "fontFamily": "Cormorant Unicase",
    "fontSize": 12,
    "fontWeightLight": 500,
    "fontWeightRegular": 600,
    "fontWeightMedium": 700,
    "fontWeightBold": 900
  },
};

// export const light: ThemeOptions = {
//   "palette": {
//     "primary": {
//       "main": "#aa1111"
//     },
//     "secondary": {
//       "main": "#387799"
//     },
//     "background": {
//       "default": "#e7d7d7",
//       "paper": "rgb(245, 238, 238)"
//     },
//     "info": {
//       "main": "#02d1be"
//     },
//     "success": {
//       "main": "#44c047"
//     },
//     "mode": "light"
//   },
//   "typography": {
//     "fontFamily": "Cormorant Unicase",
//     "fontSize": 12,
//     "fontWeightLight": 500,
//     "fontWeightRegular": 600,
//     "fontWeightMedium": 700,
//     "fontWeightBold": 900
//   },
// };

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
    "fontSize": 12,
    "fontWeightLight": 500,
    "fontWeightRegular": 600,
    "fontWeightMedium": 700,
    "fontWeightBold": 900
  },
  // colorSchemes: {
  //   // light: light,
  //   dark: dark,

  // },
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: true,
      },
    },
  }
});

export default theme