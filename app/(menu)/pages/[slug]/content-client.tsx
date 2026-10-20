"use client";

import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import Footer from "@/src/Layout/Guest/Components/Footer";
import type { CSSProperties, ReactNode } from "react";
import { Link as NavLink } from "@/src/lib/nav";

/** `src/lib/nav` is untyped JS, so every prop reads as required. */
const Link = NavLink as unknown as (props: { to: string; href: string; style?: CSSProperties; children: ReactNode }) => ReactNode;
import { CHROME_SURFACE, CHROME_TEXT } from "@/lib/menu/storeChrome";
import { MenuContainer } from "@/components/MenuContainer";
import { contactEmail, contactPhone, fullAddress, mapsHref, socialLinks, telHref, weeklyHours } from "@/lib/menu/storeInfo";

/** Typography for merchant-written page HTML. */
const PROSE = {
  "h1, h2, h3": { fontWeight: 700, lineHeight: 1.3, color: "inherit" },
  h1: { fontSize: "22px", mt: "28px", mb: "10px" },
  h2: { fontSize: "19px", mt: "28px", mb: "10px" },
  h3: { fontSize: "16px", mt: "22px", mb: "8px" },
  p: { mb: "14px" },
  "ul, ol": { pl: "22px", mb: "14px" },
  li: { mb: "6px" },
  a: { textDecoration: "underline", textUnderlineOffset: "2px", fontWeight: 600 },
  img: { maxW: "100%", h: "auto", borderRadius: "12px", my: "16px" },
  table: { width: "100%", borderCollapse: "collapse", mb: "16px" },
  "th, td": { border: "1px solid", borderColor: "blackAlpha.200", p: "8px 10px", textAlign: "left" },
  "> :first-of-type": { mt: 0 },
} as const;

function ContactCard() {
  const config = useStoreConfig();
  const phone = contactPhone(config.contact);
  const email = contactEmail(config.contact);
  const address = fullAddress(config.address);
  const directions = mapsHref(config.address);
  const hours = weeklyHours(config.businessHours);
  const whatsapp = socialLinks(config.social).find((item) => item.key === "whatsapp");
  const actions = [
    phone ? { label: "Call us", value: phone, href: telHref(phone) } : null,
    whatsapp ? { label: "WhatsApp", value: "Chat with us", href: whatsapp.href } : null,
    email ? { label: "Email", value: email, href: `mailto:${email}` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;
  if (!actions.length && !address && !hours.length) return null;
  return (
    <Box mb="28px">
      {actions.length ? (
        <Grid templateColumns={{ base: "1fr", md: `repeat(${Math.min(actions.length, 3)}, minmax(0, 1fr))` }} gap="12px" mb="16px">
          {actions.map((action) => (
            <Box
              as="a"
              key={action.label}
              href={action.href}
              target={action.href.startsWith("http") ? "_blank" : undefined}
              rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
              p="16px"
              border="1px solid"
              borderColor="blackAlpha.100"
              borderRadius="14px"
              bg="white"
              color="gray.900"
              style={{ textDecoration: "none" }}
              _hover={{ boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
            >
              <Text fontSize="12px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color="gray.500">{action.label}</Text>
              <Text fontSize="15px" fontWeight="700" mt="4px" noOfLines={1}>{action.value}</Text>
            </Box>
          ))}
        </Grid>
      ) : null}
      {address || hours.length ? (
        <Grid templateColumns={{ base: "1fr", md: address && hours.length ? "repeat(2, minmax(0, 1fr))" : "1fr" }} gap="12px">
          {address ? (
            <Box p="16px" border="1px solid" borderColor="blackAlpha.100" borderRadius="14px" bg="white" color="gray.900">
              <Text fontSize="12px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color="gray.500">Visit us</Text>
              <Text fontSize="15px" mt="6px" lineHeight="1.6">{address}</Text>
              {directions ? (
                <Box as="a" href={directions} target="_blank" rel="noopener noreferrer" display="inline-block" mt="8px" fontWeight="700" fontSize="14px" style={{ textDecoration: "none" }}>
                  Get directions →
                </Box>
              ) : null}
            </Box>
          ) : null}
          {hours.length ? (
            <Box p="16px" border="1px solid" borderColor="blackAlpha.100" borderRadius="14px" bg="white" color="gray.900">
              <Text fontSize="12px" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase" color="gray.500" mb="6px">Opening hours</Text>
              {hours.map((row) => (
                <Flex key={row.days} justify="space-between" gap="12px" fontSize="14px" py="3px">
                  <Text fontWeight="600">{row.days}</Text>
                  <Text color="gray.600" textAlign="right">{row.hours}</Text>
                </Flex>
              ))}
            </Box>
          ) : null}
        </Grid>
      ) : null}
    </Box>
  );
}

export default function StoreContentPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const config = useStoreConfig();
  const pages = config.pages || [];
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <>
        <TopBarWithBackButton headerText="Page not found" backTo="/" />
        <Box minH="50vh" px="24px" py="72px" textAlign="center" bg={CHROME_SURFACE} color={CHROME_TEXT}>
          <Text as="h1" fontSize="24px" fontWeight="800" mb="8px">
            Page not found
          </Text>
          <Text mb="24px" opacity={0.7}>
            This page is not published for this store.
          </Text>
          <Link to="/" href="/">
            <Button variant="solidFull" bg="brand.500">
              Back to menu
            </Button>
          </Link>
        </Box>
        <Footer />
      </>
    );
  }

  const others = pages.filter((p) => p.slug !== slug);
  const isContact = slug === "contact-us" || page.key === "contactUs";

  return (
    <>
      <TopBarWithBackButton headerText={page.title} backTo="/" />
      <Box bg="gray.50" color={CHROME_TEXT} minH="60vh">
        <MenuContainer px={{ base: "16px" }} py={{ base: "20px", lg: "40px" }}>
          <Flex as="nav" aria-label="Breadcrumb" fontSize="13px" color="gray.500" gap="6px" mb="14px" display={{ base: "none", md: "flex" }}>
            <Link to="/" href="/" style={{ textDecoration: "none" }}>Menu</Link>
            <Text as="span">/</Text>
            <Text as="span" color="gray.700" fontWeight="600">{page.title}</Text>
          </Flex>
          <Grid templateColumns={{ base: "1fr", lg: others.length ? "minmax(0, 1fr) 280px" : "minmax(0, 820px)" }} gap={{ base: "20px", lg: "32px" }} justifyContent={others.length ? undefined : "center"}>
            <Box as="article" bg="white" borderRadius="16px" border="1px solid" borderColor="blackAlpha.100" p={{ base: "20px", md: "32px", lg: "40px" }}>
              <Text as="h1" fontSize={{ base: "24px", lg: "32px" }} fontWeight="800" lineHeight="1.2" mb={{ base: "16px", lg: "24px" }}>
                {page.title}
              </Text>
              {isContact ? <ContactCard /> : null}
              {page.content ? (
                <Box
                  className="store-cms"
                  fontSize={{ base: "15px", lg: "16px" }}
                  lineHeight="1.75"
                  color="gray.700"
                  maxW="72ch"
                  sx={PROSE}
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              ) : !isContact ? (
                <Text opacity={0.7}>Content coming soon.</Text>
              ) : null}
            </Box>
            {others.length ? (
              <Box as="aside" alignSelf="start" position={{ lg: "sticky" }} top={{ lg: "24px" }}>
                <Box bg="white" borderRadius="16px" border="1px solid" borderColor="blackAlpha.100" p="16px">
                  <Text fontSize="12px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" color="gray.500" mb="8px">
                    More information
                  </Text>
                  {others.map((p) => (
                    <Link key={p.slug} to={`/pages/${p.slug}`} href={`/pages/${p.slug}`} style={{ textDecoration: "none" }}>
                      <Text fontSize="14px" fontWeight="600" color="gray.800" py="8px" borderTop="1px solid" borderColor="blackAlpha.50" _hover={{ color: "gray.900", textDecoration: "underline" }}>
                        {p.title}
                      </Text>
                    </Link>
                  ))}
                  <Link to="/" href="/" style={{ textDecoration: "none" }}>
                    <Button mt="12px" w="100%" size="sm" variant="outline">Back to menu</Button>
                  </Link>
                </Box>
              </Box>
            ) : null}
          </Grid>
        </MenuContainer>
      </Box>
      <Footer />
    </>
  );
}
