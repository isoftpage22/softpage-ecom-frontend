"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { FaCheck, FaEnvelope, FaFacebookF, FaLink, FaShareNodes, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

function shareTargets(url, text) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return [
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { key: "x", label: "X (Twitter)", icon: FaXTwitter, color: "#111111", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { key: "telegram", label: "Telegram", icon: FaTelegram, color: "#229ED9", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { key: "email", label: "Email", icon: FaEnvelope, color: "#4B5563", href: `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n${url}`)}` },
  ];
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Older browsers and non-https pages: fall back to a hidden text box.
    const box = document.createElement("textarea");
    box.value = value;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  }
}

function ShareIcon({ icon, color }) {
  return (
    <Flex w="28px" h="28px" borderRadius="full" bg={`${color}1A`} color={color} align="center" justify="center" flexShrink={0}>
      <Box as={icon} boxSize="14px" />
    </Flex>
  );
}

/** Menu contents. Only mounted while the menu is open, so it can read the page URL directly. */
function ShareItems({ title, message }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split("#")[0];
  const canNativeShare = typeof navigator.share === "function";

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: message, url });
    } catch {
      // Closed the sheet: nothing to do.
    }
  };

  const onCopy = async () => {
    if (await copyText(url)) setCopied(true);
  };

  return (
    <>
      {canNativeShare ? (
        <MenuItem onClick={nativeShare} gap="10px" py="8px">
          <ShareIcon icon={FaShareNodes} color="#111111" />
          <Text fontSize="14px" fontWeight="600">More apps…</Text>
        </MenuItem>
      ) : null}
      {shareTargets(url, message).map((target) => (
        <MenuItem key={target.key} as="a" href={target.href} target="_blank" rel="noopener noreferrer" gap="10px" py="8px" style={{ textDecoration: "none" }}>
          <ShareIcon icon={target.icon} color={target.color} />
          <Text fontSize="14px" fontWeight="600">{target.label}</Text>
        </MenuItem>
      ))}
      <MenuItem onClick={onCopy} gap="10px" py="8px" borderTop="1px solid" borderColor="gray.100" mt="4px">
        <ShareIcon icon={copied ? FaCheck : FaLink} color={copied ? "#15803d" : "#4B5563"} />
        <Text fontSize="14px" fontWeight="600" color={copied ? "green.700" : undefined}>
          {copied ? "Link copied" : "Copy link"}
        </Text>
      </MenuItem>
    </>
  );
}

/**
 * Share a page: the phone's own share sheet when there is one, the main apps,
 * and copy link.
 */
export default function ShareButton({ title, text }) {
  return (
    <Menu placement="bottom-end" isLazy closeOnSelect={false}>
      {/* A plain button: the theme's Button variants force a black fill. */}
      <MenuButton
        as={Box}
        role="button"
        tabIndex={0}
        aria-label="Share"
        w="40px"
        h="40px"
        minW="40px"
        borderRadius="full"
        border="1px solid"
        borderColor="gray.200"
        bg="white"
        color="#111827"
        cursor="pointer"
        flexShrink={0}
        _hover={{ bg: "gray.50" }}
        sx={{ "& > span": { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" } }}
      >
        <Box as={FaShareNodes} boxSize="16px" />
      </MenuButton>
      <MenuList minW="220px" py="6px" zIndex={40} boxShadow="0 12px 32px rgba(15,23,42,0.16)" borderRadius="12px">
        <Text px="14px" pt="4px" pb="8px" fontSize="12px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.06em">
          Share
        </Text>
        <ShareItems title={title} message={text || title || ""} />
      </MenuList>
    </Menu>
  );
}
