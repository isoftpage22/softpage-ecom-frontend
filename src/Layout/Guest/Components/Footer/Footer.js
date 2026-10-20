import { Flex, Text, Box, Grid } from '@chakra-ui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { MdOutlineEmail, MdOutlinePhone, MdOutlinePlace } from 'react-icons/md';
import { useSelector } from 'react-redux';
import FooterCartDetail from '../../../Components/FooterCartDetail';
import CartPageFooter from '../../../Components/CartPageFooter/CartPageFooter';
import { useStoreCapabilities, useStoreConfig } from '@/lib/tenant/TenantContext';
import { isStoreAcceptingOrders } from '@/lib/store/operationalHours';
import { Link } from '../../../../lib/nav';
import { StoreLogo } from '@/components/StoreLogo';
import { CHROME_ACCENT, CHROME_BAR_BG, CHROME_SURFACE, CHROME_TEXT } from '@/lib/menu/storeChrome';
import { showsOrderBar } from '@/lib/cart/persistCart';
import { MenuContainer } from '@/components/MenuContainer';
import { contactEmail, contactPhone, fullAddress, mapsHref, socialLinks, telHref, weeklyHours } from '@/lib/menu/storeInfo';

const linkStyle = { textDecoration: 'none' };

function FooterHeading({ children, mb = '12px' }) {
    return (
        <Text fontSize="12px" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" opacity={0.6} mb={mb}>
            {children}
        </Text>
    );
}

function FooterLink({ href, external, children }) {
    const text = <Text fontSize="14px" fontWeight="500" py="4px" _hover={{ textDecoration: 'underline' }}>{children}</Text>;
    return external
        ? <Box as="a" href={href} display="block" style={linkStyle} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{text}</Box>
        : <Link to={href} href={href} style={linkStyle}>{text}</Link>;
}

function ContactRow({ icon, href, external, children }) {
    return (
        <Flex
            as="a"
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            align="flex-start"
            gap="10px"
            py="5px"
            fontSize="14px"
            style={linkStyle}
            _hover={{ textDecoration: 'underline' }}
        >
            <Box as={icon} boxSize="18px" mt="1px" flexShrink={0} opacity={0.7} />
            <Box minW={0} lineHeight="1.5">{children}</Box>
        </Flex>
    );
}

/** "Open now" / "Closed now", worked out in the browser so it matches the visitor's clock. */
function useOpenNow(config) {
    const [open, setOpen] = useState(null)
    useEffect(() => {
        if (!config.businessHours) return undefined
        const check = () => setOpen(isStoreAcceptingOrders({ isStoreOpen: config.isStoreOpen, businessHours: config.businessHours, timezone: config.timezone }))
        check()
        const timer = setInterval(check, 60000)
        return () => clearInterval(timer)
    }, [config.isStoreOpen, config.businessHours, config.timezone])
    return open
}

const Footer = (props) => {
    const { isShoppingCart, hideVisual } = props
    const config = useStoreConfig()
    const { tableReservation } = useStoreCapabilities()
    const openNow = useOpenNow(config)
    const qty = props.addToCart
        ? props.addToCart.products.reduce((sum, product) => sum + Number(product.quantity || 0), 0)
        : 0;
    let price = 0;
    props.addToCart && props.addToCart.products.map((product) => {
        price = Number(price) + Number(product.total_amount);
        return price;
    });
    const currentYear = new Date().getFullYear();
    const pages = Array.isArray(props.pages) && props.pages.length ? props.pages : (config.pages || [])
    const social = props.social && Object.keys(props.social).length ? props.social : config.social
    const contact = props.contact?.phone || props.contact?.email ? props.contact : config.contact
    const legal = pages.filter((p) => p.group === 'legal')
    const company = pages.filter((p) => p.group === 'company')
    const contactHref = contact?.phone
        ? `tel:${contact.phone}`
        : contact?.email
            ? `mailto:${contact.email}`
            : null

    const activeOrder = useSelector((state) => state.shoppingCart.activeOrder)
    const stickyOrder = showsOrderBar(activeOrder)

    const cartBar = qty > 0 && !isShoppingCart
        ? <FooterCartDetail {...props} qty={qty} price={price} />
        : qty > 0
            ? <CartPageFooter qty={qty} {...props} price={price} />
            : !isShoppingCart && stickyOrder
                ? <FooterCartDetail {...props} qty={0} price={0} />
                : null

    if (hideVisual) {
        return <Fragment>{cartBar}</Fragment>
    }

    const phone = contactPhone(contact)
    const email = contactEmail(contact)
    const address = fullAddress(config.address)
    const mapHref = mapsHref(config.address)
    const hours = weeklyHours(config.businessHours)
    const socials = socialLinks(social)
    const policyLinks = legal.map((p) => ({ name: p.title, href: `/pages/${p.slug}` }))
    const companyLinks = [
        { name: 'Order online', href: '/' },
        ...(tableReservation ? [{ name: 'Reserve a table', href: '/book' }] : []),
        ...company.map((p) => ({ name: p.title, href: `/pages/${p.slug}` })),
        ...(contactHref && !company.some((p) => p.slug === 'contact-us') ? [{ name: 'Contact Us', href: contactHref, external: true }] : []),
    ]

    return (
        <Fragment>
            <Box as="footer" bg={CHROME_SURFACE} color={CHROME_TEXT} borderTop="1px solid" borderColor="blackAlpha.100">
                <MenuContainer px={{ base: '20px' }} py={{ base: '28px', lg: '44px' }}>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: '1.5fr 1fr 1fr 1.2fr' }} gap={{ base: '28px', lg: '40px' }}>
                        <Box>
                            <Flex align="center" gap="12px" mb="12px">
                                <StoreLogo src={config.logo} name={config.name || 'Store'} size="48px" />
                                <Text fontSize="18px" fontWeight="800">{config.name || 'Store'}</Text>
                            </Flex>
                            {config.description ? (
                                <Text fontSize="14px" opacity={0.75} lineHeight="1.6" mb="12px" noOfLines={3}>{config.description}</Text>
                            ) : null}
                            {address ? (
                                <ContactRow icon={MdOutlinePlace} href={mapHref || undefined} external>
                                    <Text as="span" display="block" opacity={0.85}>{address}</Text>
                                    {mapHref ? <Text as="span" display="block" fontWeight="600" mt="2px">Get directions →</Text> : null}
                                </ContactRow>
                            ) : null}
                            {phone ? <ContactRow icon={MdOutlinePhone} href={telHref(phone)}><Text as="span" fontWeight="600">{phone}</Text></ContactRow> : null}
                            {email ? <ContactRow icon={MdOutlineEmail} href={`mailto:${email}`}><Text as="span" fontWeight="600" wordBreak="break-all">{email}</Text></ContactRow> : null}
                        </Box>
                        {policyLinks.length ? (
                            <Box as="nav" aria-label="Policies">
                                <FooterHeading>Policies</FooterHeading>
                                {policyLinks.map((link) => <FooterLink key={link.href} href={link.href}>{link.name}</FooterLink>)}
                            </Box>
                        ) : null}
                        {companyLinks.length ? (
                            <Box as="nav" aria-label="About the store">
                                <FooterHeading>Company</FooterHeading>
                                {companyLinks.map((link) => <FooterLink key={link.href} href={link.href} external={link.external}>{link.name}</FooterLink>)}
                            </Box>
                        ) : null}
                        {hours.length || socials.length ? (
                            <Box>
                                {hours.length ? (
                                    <Box mb={socials.length ? '20px' : 0}>
                                        <Flex align="center" justify="space-between" gap="8px" mb="12px">
                                            <FooterHeading mb="0">Opening hours</FooterHeading>
                                            {openNow != null ? (
                                                <Flex align="center" gap="6px" px="10px" py="3px" borderRadius="999px" bg={openNow ? 'green.50' : 'red.50'} color={openNow ? 'green.700' : 'red.700'} fontSize="12px" fontWeight="700" flexShrink={0}>
                                                    <Box w="6px" h="6px" borderRadius="full" bg="currentColor" />
                                                    {openNow ? 'Open now' : 'Closed now'}
                                                </Flex>
                                            ) : null}
                                        </Flex>
                                        {hours.map((row) => (
                                            <Flex key={row.days} justify="space-between" gap="12px" fontSize="14px" py="3px">
                                                <Text fontWeight="600">{row.days}</Text>
                                                <Text opacity={0.8} textAlign="right">{row.hours}</Text>
                                            </Flex>
                                        ))}
                                    </Box>
                                ) : null}
                                {socials.length ? (
                                    <Box>
                                        <FooterHeading>Follow us</FooterHeading>
                                        <Flex gap="8px" flexWrap="wrap">
                                            {socials.map((item) => (
                                                <Box
                                                    as="a"
                                                    key={item.key}
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    px="12px"
                                                    py="6px"
                                                    borderRadius="999px"
                                                    border="1px solid"
                                                    borderColor="blackAlpha.200"
                                                    fontSize="13px"
                                                    fontWeight="600"
                                                    style={linkStyle}
                                                    _hover={{ bg: 'blackAlpha.50' }}
                                                >
                                                    {item.label}
                                                </Box>
                                            ))}
                                        </Flex>
                                    </Box>
                                ) : null}
                            </Box>
                        ) : null}
                    </Grid>
                </MenuContainer>
            </Box>
            <Box bg={CHROME_BAR_BG} pb={cartBar ? { base: 'calc(140px + env(safe-area-inset-bottom, 0px))', lg: 0 } : 0}>
                <MenuContainer px={{ base: '20px' }} py="16px">
                    <Flex justify="space-between" align="center" gap="12px" flexWrap="wrap" direction={{ base: 'column', md: 'row' }}>
                        <Text textColor="whiteAlpha.700" fontSize="13px">© {currentYear} {config.name || 'Store'}. All rights reserved.</Text>
                        <Flex
                            as="a"
                            href="https://www.softpage.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            align="center"
                            gap="8px"
                            aria-label="Powered by Softpage"
                            style={linkStyle}
                        >
                            <Text textColor="whiteAlpha.700" fontSize="12px">Powered by</Text>
                            <Box border="2px solid" borderColor={CHROME_ACCENT} px="8px" py="2px">
                                <Text textColor="white" fontSize="13px" fontWeight="700" letterSpacing="0.06em">SOFTPAGE</Text>
                            </Box>
                        </Flex>
                    </Flex>
                </MenuContainer>
            </Box>
            {isShoppingCart ? cartBar : (
                <Box display={{ base: "block", lg: "none" }}>{cartBar}</Box>
            )}
        </Fragment>
    );
}


export default Footer;
