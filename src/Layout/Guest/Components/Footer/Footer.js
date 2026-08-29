import { Flex, Text, Box } from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import FooterCartDetail from '../../../Components/FooterCartDetail';
import CartPageFooter from '../../../Components/CartPageFooter/CartPageFooter';
import { useStoreConfig } from '@/lib/tenant/TenantContext';
import { Link } from '../../../../lib/nav';
import { StoreLogo } from '@/components/StoreLogo';
import { CHROME_ACCENT, CHROME_BAR_BG, CHROME_SURFACE, CHROME_TEXT } from '@/lib/menu/storeChrome';
import { showsOrderBar } from '@/lib/cart/persistCart';

const SOCIAL_KEYS = ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'whatsapp', 'telegram'];

const Footer = (props) => {
    const { isShoppingCart, hideVisual } = props
    const config = useStoreConfig()
    const qty = props.addToCart
        ? props.addToCart.products.reduce((sum, product) => sum + Number(product.quantity || 0), 0)
        : 0;
    let price = 0;
    props.addToCart && props.addToCart.products.map((product) => {
        price = Number(price) + Number(product.total_amount);
        return price;
    });
    const currentYear = new Date().getFullYear();
    const pages = config.pages || []
    const legal = pages.filter((p) => p.group === 'legal')
    const company = pages.filter((p) => p.group === 'company')
    const contactHref = config.contact?.phone
        ? `tel:${config.contact.phone}`
        : config.contact?.email
            ? `mailto:${config.contact.email}`
            : null
    const topLinks = [
        ...legal.map((p) => ({ name: p.title, href: `/pages/${p.slug}`, external: false })),
        ...(contactHref && !company.some((p) => p.slug === 'contact-us')
            ? [{ name: 'Contact Us', href: contactHref, external: true }]
            : []),
        ...company.filter((p) => p.slug === 'contact-us').map((p) => ({ name: p.title, href: `/pages/${p.slug}`, external: false })),
    ]
    const bottomLinks = company.filter((p) => p.slug !== 'contact-us').map((p) => ({ name: p.title, href: `/pages/${p.slug}` }))
    const socialLinks = SOCIAL_KEYS
        .filter((key) => config.social?.[key])
        .map((key) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), href: config.social[key] }))

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

    return (
        <Fragment>
            <Flex bg={CHROME_SURFACE} color={CHROME_TEXT} justifyContent="center" alignItems="center" flexDirection="column" pt="16px" pb="8px">
                <Box mb="24px">
                    <StoreLogo src={config.logo} name={config.name || 'Store'} size="48px" />
                </Box>
                {topLinks.map((link) => (
                    link.external ? (
                        <Box as="a" href={link.href} key={link.name} mb="10px">
                            <Text fontWeight="700">{link.name}</Text>
                        </Box>
                    ) : (
                        <Link key={link.name} to={link.href} href={link.href}>
                            <Text mb="10px" fontWeight="700">{link.name}</Text>
                        </Link>
                    )
                ))}
            </Flex>
            <Flex minH="28vh" bg={CHROME_BAR_BG} justifyContent="center" alignItems="center" flexDirection="column" px="16px" py="24px" pb={cartBar ? "calc(140px + env(safe-area-inset-bottom, 0px))" : "24px"}>
                <Text textColor="whiteAlpha.700" fontSize="14px" fontWeight="400" mb="20px" mt="10px">Platform Powered by</Text>
                <Box border="3px solid" borderColor={CHROME_ACCENT} p="10px" mb="30px">
                    <Text textColor="white" fontSize="25px">SOFTPAGE</Text>
                </Box>
                {bottomLinks.map((p) => (
                    <Link key={p.href} to={p.href} href={p.href}>
                        <Text textColor="#d1d1d1" mb="14px">{p.name}</Text>
                    </Link>
                ))}
                {socialLinks.length > 0 ? (
                    <Flex gap="16px" flexWrap="wrap" justifyContent="center" mb="18px">
                        {socialLinks.map((item) => (
                            <Box as="a" key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">
                                <Text textColor="whiteAlpha.800" fontSize="13px" fontWeight="600">{item.name}</Text>
                            </Box>
                        ))}
                    </Flex>
                ) : null}
                <Text textColor="#9ea6b9" mb="5px">© {currentYear} {config.name || 'Store'}</Text>
            </Flex>
            {cartBar}
        </Fragment>
    );
}


export default Footer;
