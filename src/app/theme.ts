import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SobrioPreset = definePreset(Aura, {

  primitive: {
    secondary: {
      50: '#f3fdff',
      100: '#dbf9ff',
      200: '#b7f2ff',
      300: '#88eaff',
      400: '#4ce0ff',
      500: '#10d5ff',
      600: '#0eb5d9',
      700: '#0b95b3',
      800: '#09758c',
      900: '#065566',
      950: '#043540',
    },
    tertiary: {
      50: '#fffbf2',
      100: '#fff4d9',
      200: '#ffe8b3',
      300: '#ffd980',
      400: '#ffc640',
      500: '#ffb300',
      600: '#d99800',
      700: '#b37d00',
      800: '#8c6200',
      900: '#664800',
      950: '#402d00',
    },
  },
  semantic: {
    primary: {
      50: '#f2feff',
      100: '#d9fbff',
      200: '#b3f7ff',
      300: '#80f2ff',
      400: '#40ecff',
      500: '#00e5ff',
      600: '#00c3d9',
      700: '#00a0b3',
      800: '#007e8c',
      900: '#005c66',
      950: '#003940',
    },
    colorScheme: {
      light: {
        primary: {
          contrastColor: '#0f1112',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f5f5f6',
          100: '#ececec',
          200: '#dbdbdb',
          300: '#c3c4c4',
          400: '#a4a5a5',
          500: '#878889',
          600: '#6a6b6c',
          700: '#4b4d4d',
          800: '#333536',
          900: '#202223',
          950: '#0f1112',
        },
      },
    },
  },
});
