

export  const Button = {
  // The styles all button have in common
  baseStyle: {
    fontWeight: "bold",
    textTransform: "upperCase",
    borderRadius: "base", // <-- border radius is same for all variants and sizes
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
  },
  // Two variants: outline and solid
  variants: {
    outline: {
      border: "1px",
      borderColor: "#C7B9FF",
      color: "black",
      width:"20px",
      backgroundColor:'#C7B9FF',
      height:"15px",
      minWidth:'8px',

    },
    solid: {
      bg: "black",
      color: "white",
      height:"20px",
      width:"69px"
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