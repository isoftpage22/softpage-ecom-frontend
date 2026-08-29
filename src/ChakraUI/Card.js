export const MenuCard = {
  baseStyle: {
    display: "flex",
    width: "100%",
    background: "white",
    alignItems: "flex-start",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  variants: {
    rounded: {
      padding: 4,
      borderRadius: "md",
      width: "320px",
      border: "0.5px solid #0000003b",
      boxShadow: "0.5px 1px #ece6d4",
    },
    smooth: {
      paddingTop: "28px",
      paddingBottom: "28px",
      paddingLeft: "6%",
      paddingRight: "6%",
      borderRadius: "base",
      borderBottom: "1px solid #DAD9D9",
    },
  },
  defaultProps: {
    variant: "smooth",
  },
}

/** @deprecated Chakra v2 owns `Card`; keep alias for any leftover imports. */
export const Card = MenuCard
