
import { extendTheme } from "@chakra-ui/react"
import {Button} from "./Button"
import {MenuCard} from "./Card"
import {Text} from "./Text"

const hsl = (token) => `hsl(var(${token}))`

const MENU_SANS = 'var(--font-body, var(--font-montserrat)), Montserrat, sans-serif'
const MENU_HEADING = 'var(--font-heading, var(--font-body, var(--font-montserrat))), Montserrat, sans-serif'
const MENU_WORK = "var(--font-work-sans), 'Work Sans', sans-serif"

const fieldInk = {
  color: "var(--brand-on-surface, #1A1A1A)",
  _placeholder: { color: "gray.400", opacity: 1 },
}

const Input = {
  baseStyle: {
    field: fieldInk,
  },
}

const Textarea = {
  baseStyle: fieldInk,
}

const FormLabel = {
  baseStyle: {
    color: "var(--brand-on-surface, #1A1A1A)",
  },
}

const PinInput = {
  baseStyle: fieldInk,
}

const overrides = {
  fonts: {
    heading: MENU_HEADING,
    body: MENU_SANS,
    montserrat: MENU_SANS,
    workSans: MENU_WORK,
  },
  colors: {
    brand: {
      50: hsl("--brand-50"),
      100: hsl("--brand-100"),
      200: hsl("--brand-200"),
      300: hsl("--brand-300"),
      400: hsl("--brand-400"),
      500: hsl("--brand-500"),
      600: hsl("--brand-600"),
      700: hsl("--brand-700"),
      800: hsl("--brand-800"),
      900: hsl("--brand-900"),
    },
  },
  styles: {
    global: {
      body: {
        fontFamily: MENU_SANS,
        color: "var(--brand-on-surface, var(--brand-text, #171717))",
      },
      "input, textarea, select": {
        color: "var(--brand-on-surface, #1A1A1A)",
      },
    },
  },
  components: {
    MenuCard,
    Button,
    Text,
    Input,
    Textarea,
    FormLabel,
    PinInput,
  },
}

export default extendTheme(overrides)
