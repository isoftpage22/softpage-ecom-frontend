"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useStoreConfig } from "@/lib/tenant/TenantContext";
import TopBarWithBackButton from "@/src/Layout/Components/TopBarWithBackButton/TopBarWithBackButton";
import Footer from "@/src/Layout/Guest/Components/Footer";
import { Link } from "@/src/lib/nav";
import { CHROME_SURFACE, CHROME_TEXT } from "@/lib/menu/storeChrome";

export default function StoreContentPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const config = useStoreConfig();
  const page = (config.pages || []).find((p) => p.slug === slug);

  if (!page) {
    return (
      <Box minH="40vh" px="24px" py="64px" textAlign="center" bg={CHROME_SURFACE} color={CHROME_TEXT}>
        <Text fontSize="22px" fontWeight="700" mb="8px">
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
    );
  }

  return (
    <>
      <TopBarWithBackButton headerText={page.title} />
      <Box px="20px" py="24px" bg={CHROME_SURFACE} color={CHROME_TEXT} minH="50vh">
        <Text as="h1" fontSize="24px" fontWeight="800" mb="16px">
          {page.title}
        </Text>
        {page.content ? (
          <Box
            className="store-cms"
            fontSize="15px"
            lineHeight="1.7"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <Text opacity={0.7}>Content coming soon.</Text>
        )}
      </Box>
      <Footer />
    </>
  );
}
