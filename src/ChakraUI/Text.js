

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
      fontFamily : "var(--font-montserrat), Montserrat, sans-serif",
      fontStyle:'normal',
      fontWeight:'normal',
      fontSize:'14px',
      lineHeight:'17px',
      color: '#787676',

       
    },
    solid: {
     color: "#131212",
    fontFamily : "var(--font-montserrat), Montserrat, sans-serif",
     fontWeight:'bolder',
     fontStyle:'normal',
     fontSize:'16px',
     lineHeight:'19px'
     
    },
    landingNav: {
      fontFamily: "var(--font-work-sans), 'Work Sans', sans-serif",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "30px",
      lineHeight: "35px",
      color: "#131212",
     },
     landingHeader: {
      color: "#131212",
      fontFamily : "var(--font-montserrat), Montserrat, sans-serif",
      fontWeight:'bolder',
      fontStyle:'normal',
      fontSize:'16px',
      lineHeight:'19px'
     },
    solidCart: {
     color: "#131212",
     fontFamily : "var(--font-montserrat), Montserrat, sans-serif",
     fontWeight:'400',
     fontStyle:'normal',
     fontSize:'16px',
     lineHeight:'19px'
     
    },
    solidCartTip: {
    fontFamily : "var(--font-work-sans), 'Work Sans', sans-serif",
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
    fontFamily : "var(--font-work-sans), 'Work Sans', sans-serif",
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