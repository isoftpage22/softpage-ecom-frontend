"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { toCdnImageUrl } from "../../../lib/cdn/imageUrl";

function imageUrl(image) {
  return toCdnImageUrl(image?.productImageUrl || image?.url || "");
}

const ProductImageSlider = ({ images = [], alt = "" }) => {
  const urls = (images || []).map(imageUrl).filter(Boolean);
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const go = (next) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  if (!urls.length) {
    return <Box w="100%" h="280px" bg="#E4E1E1" />;
  }

  return (
    <Box position="relative" bg="#111">
      <Flex
        ref={scrollerRef}
        onScroll={onScroll}
        overflowX="auto"
        overflowY="hidden"
        scrollSnapType="x mandatory"
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {urls.map((src, i) => (
          <Box
            key={`${src}-${i}`}
            flex="0 0 100%"
            w="100%"
            h="280px"
            scrollSnapAlign="start"
          >
            <img
              src={src}
              alt={alt ? `${alt} ${i + 1}` : ""}
              width={750}
              height={560}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ))}
      </Flex>
      {urls.length > 1 ? (
        <Flex position="absolute" bottom="10px" left="0" right="0" justify="center" gap="6px">
          {urls.map((_, i) => (
            <Box
              key={i}
              as="button"
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => go(i)}
              w={i === index ? "18px" : "6px"}
              h="6px"
              borderRadius="full"
              bg={i === index ? "white" : "whiteAlpha.600"}
              border="none"
              cursor="pointer"
            />
          ))}
        </Flex>
      ) : null}
    </Box>
  );
};

export default ProductImageSlider;
