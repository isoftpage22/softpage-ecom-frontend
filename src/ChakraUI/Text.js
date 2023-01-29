

export  const Text = {
  // The styles all button have in common
  baseStyle: {
    // color: "orange",
    // fontWeight: "bold",
    // textTransform: "lowerCase",
    // borderRadius: "base", // <-- border radius is same for all variants and sizes
    // _focus: { boxShadow: 'none' },
    // track:{_focus: { boxShadow: 'none' }},
    // boxShadow: 'none'
  },
  // Two sizes: sm and md
  sizes: {
    sm: {
      fontSize: "sm",
      
    },
    xsm:{
      fontSize: "12px",
    },
    md: {
      fontSize: "md",
   
    },
  },
  // Two variants: outline and solid
  variants: {
    outline: {
      fontFamily : "Montserrat",
      fontStyle:'normal',
      fontWeight:'normal',
      fontSize:'14px',
      lineHeight:'17px',
      color: '#787676',

       
    },
    solid: {
     color: "#131212",
    fontFamily : "Montserrat",
     fontWeight:'bolder',
     fontStyle:'normal',
     fontSize:'16px',
     lineHeight:'19px'
     
    },
    landingNav: {
      fontFamily: "Work Sans",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "30px",
      lineHeight: "35px",
      color: "#131212",
     },
     landingHeader: {
      color: "#131212",
      fontFamily : "Montserrat",
      fontWeight:'bolder',
      fontStyle:'normal',
      fontSize:'16px',
      lineHeight:'19px'
     },
    solidCart: {
     color: "#131212",
     fontFamily : "Montserrat",
     fontWeight:'400',
     fontStyle:'normal',
     fontSize:'16px',
     lineHeight:'19px'
     
    },
    solidCartTip: {
    fontFamily : "Work Sans",
     fontWeight:'bold',
     fontStyle:'normal',
     fontSize:'16px',
     lineHeight:'19px'
     
    },
    muted: {
     color: "#787676",
     fontSize:'12px',
     lineHeight:'17px',
     fontWeight:'400',
     
    },
    mutedCart: {
    fontFamily : "Work Sans",
    fontStyle:'normal',
    fontWeight:'400',
    fontSize:'14px',
    lineHeight:'20px',
    color: "#787676",
     
    },
  },
  // The default size and variant values
  defaultProps: {
    size: "sm",
    variant: "solid",
  },
}