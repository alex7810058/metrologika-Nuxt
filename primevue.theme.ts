// themes/myTheme.ts
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const Theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e6f0f7',  // самый светлый
      100: '#cce1ef',
      200: '#99c3df',
      300: '#66a5cf',
      400: '#3387bf',
      500: '#1c5c99',  // ваш базовый цвет
      600: '#164a7a',
      700: '#11375c',
      800: '#0b253d',
      900: '#06121f',
      950: '#03090e'   // самый тёмный
    }
  },
  components: {
    button: {
      root: {
        primary: {
          background: '{primary.500}',
          hoverBackground: '{primary.600}',
          activeBackground: '{primary.700}',
          borderColor: '{primary.500}',
          hoverBorderColor: '{primary.600}',
          activeBorderColor: '{primary.700}',
          color: '#ffffff',
          hoverColor: '#ffffff',
          activeColor: '#ffffff'
        }
      }
    }
  }
})
