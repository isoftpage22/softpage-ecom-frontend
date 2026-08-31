
const filledBlack = {
  bg: "black",
  color: "white",
  _hover: {
    bg: "black",
    _disabled: { bg: "black", color: "white" },
  },
  _active: { bg: "black" },
  _disabled: { bg: "black", color: "white", opacity: 0.85, cursor: "not-allowed" },
  _loading: { bg: "black", color: "white", opacity: 1 },
}

export  const Button = {
  // The styles all button have in common
  baseStyle: {
    fontWeight: "bold",
    textTransform: "upperCase",
    borderRadius: "base", // <-- border radius is same for all variants and sizes
    _focus: {
      boxShadow: "none", // Remove the focus outline (box shadow)
    },
    // Chakra default is `_hover._disabled.bg: initial`, which wipes custom
    // fills while isLoading (button is disabled + still hovered after click).
    _hover: {
      _disabled: {
        bg: "unset",
      },
    },
  },
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: "sm",
      
      px: 4, // <-- px is short for paddingLeft and paddingRight
      py: 3, // <-- py is short for paddingTop and paddingBottom
    },
    md: {
      fontSize: "md",
      px: 6, 
      py: 4, 
    },
    lg:{
      fontSize:"lg",
      px: 6, 
      py: 6, 
    },
   
  },
  // Two variants: outline and solid
  variants: {
    outline: {
      border: "1px",
      borderColor: "black",
      color: "white",
      width:"20px",
      backgroundColor:'black',
      height:"15px",
      minWidth:'8px',
      activeColor:'black',
      focusBorderColor:"none" ,
      focusBoxShadow:"none",
      ...filledBlack,
      _active: {
        bg: "black",
        border:'none'
      },
    },
    ghost:{

    },
    outlineGhost:{
      border: "1px",
      borderColor: "black",
      color: "black",
      width:"20px",
      height:"15px",
      minWidth:'8px',
      activeColor:'black',
      focusBorderColor:"none" ,
      focusBoxShadow:"none",
      _hover: {
        bg: "none", 
      },
      _active: {
        bg: "none", 
      },

    },
    solid: {
      ...filledBlack,
      height:"20px",
      width:"69px"
    },
    solidFull:{
      ...filledBlack,
      height:"39px",
      width:"100%"
    },
    transLucent: {
      color: "black",
      width:"20px",
      height:"15px",
    
      
    },
    chips:{
      color: "black",
      width:"20px",
      height:"20px",
      color: "black",
    }
  },
  // The default size and variant values
  defaultProps: {
    size: "md",
  //  variant: "outline",
  },
}