export const Card = {
  // The styles all Cards have in common
  baseStyle: {
    display: "flex",
    background: "white",
    alignItems: "center",
    justifyContent:"center",
    border:"5px",
    
  
  },
  // Two variants: rounded and smooth
  variants: {
    rounded: {
      padding: 4,
      borderRadius: "md",
      // boxShadow: "xl",
      width:'320px',
      // height:'120px',

      border:'0.5px solid #0000003b',
      boxShadow:'0.5px 1px #ece6d4'
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