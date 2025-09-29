import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    config: { initialColorMode: 'light', useSystemColorMode: false },
    fonts: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
})
export default theme
