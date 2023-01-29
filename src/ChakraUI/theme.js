
import { extendTheme } from "@chakra-ui/react"
// Component style overrides
 import {Button} from "./Button"
import {Card} from "./Card"
import {Text} from "./Text"




const overrides = {
  styles: {
    global: {
      body: {
        // bg: '#F5F4F7',
        // color: '#000',
        // fontWeight: 400,
        // fontSize: '14px',
      },
      // p: {
      //   color: '#7F838A',
      //   marginBottom: '0px',
      // },
    },
  },
  // Other foundational style overrides go here
  components: {
    Card,
    Button,
    Text
   
    // Other components go here
  },
}

export default extendTheme(overrides)