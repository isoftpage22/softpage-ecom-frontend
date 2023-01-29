export const Card = {
  // The styles all Cards have in common
  baseStyle: {
    display: "flex",
    background: "white",
    alignItems: "center",
    border:"5px",
    
  
  },
  // Two variants: rounded and smooth
  variants: {
    rounded: {
      padding: 8,
      borderRadius: "xl",
      // boxShadow: "xl",
      width:'320px',
      border:'2px solid black',
    },
    smooth: {
      padding: "6%",
      borderRadius: "base",
      borderBottom:'1px solid #DAD9D9',

      // boxShadow: "md",
    },
  },
  // The default variant value
  defaultProps: {
    variant: "smooth",
  },
}