import { Box, Flex, Text } from '@chakra-ui/react'
import React from 'react'

/**
 * Tiny +/− control that must NOT use the themed Chakra `Button`.
 * Theme `solid` is a black 69×20 fill with md padding; that clips "+" into a
 * solid slab (and `_disabled` / `_hover` force the fill back to black).
 */
const QtyStepper = ({
  quantity,
  onDecrement,
  onIncrement,
  incrementDisabled = false,
  decrementDisabled = false,
  size = 'sm',
}) => {
  const compact = size === 'sm'
  const hit = compact ? '28px' : '40px'
  const width = compact ? '76px' : '120px'

  return (
    <Flex
      align="center"
      justify="space-between"
      h={hit}
      w={width}
      maxW={width}
      bg="white"
      border="1px solid #D7D7D7"
      borderRadius="6px"
      overflow="hidden"
      flexShrink={0}
    >
      <StepButton
        ariaLabel="Decrease quantity"
        disabled={decrementDisabled}
        onClick={onDecrement}
        size={hit}
      >
        −
      </StepButton>
      <Text
        flex="1"
        minW="0"
        textAlign="center"
        fontSize={compact ? '13px' : '15px'}
        fontWeight="700"
        color="#111"
        lineHeight="1"
        textTransform="none"
        userSelect="none"
      >
        {quantity}
      </Text>
      <StepButton
        ariaLabel="Increase quantity"
        disabled={incrementDisabled}
        onClick={onIncrement}
        size={hit}
      >
        +
      </StepButton>
    </Flex>
  )
}

function StepButton({ ariaLabel, disabled, onClick, size, children }) {
  return (
    <Box
      as="button"
      type="button"
      aria-label={ariaLabel}
      w={size}
      h={size}
      minW={size}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize="18px"
      lineHeight="1"
      fontWeight="600"
      color={disabled ? '#B0B0B0' : '#111'}
      bg="transparent"
      border="none"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      disabled={disabled}
      textTransform="none"
      p="0"
      onClick={(event) => {
        event.stopPropagation()
        if (disabled) return
        onClick?.(event)
      }}
    >
      {children}
    </Box>
  )
}

export default QtyStepper
