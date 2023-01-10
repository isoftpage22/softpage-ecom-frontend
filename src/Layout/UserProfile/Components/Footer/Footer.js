import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import LocationModal from '../../../../Components/Modal/LocationModal/LocationModal';
import FooterCartDetail from '../../../Components/FooterCartDetail';

const Footer = props => {
    return (
        <Fragment>
            <LocationModal />
            <footer className="footer_part">
                <div className="container">
                    <div className="row justify-content-around">
                        <div className="col-sm-6 col-lg-4">
                            <div className="single_footer_part">
                                <h4>Contact Information</h4>
                                <ul className="list-unstyled">
                                    <li className="mb-2"><strong className="text-yellow">Email :</strong> <a href="mailto:contact@instashop.ae">media@kees.qa</a></li>
                                    {/* <li className="mb-2">Address : 07th Floor Al Bidda Tower West Bay, Doha, Qatar</li> */}
                                    <li className="mb-2"><strong className="text-yellow">Timings:</strong> 09 AM to 05:30 PM</li>
                                    <li className="mb-2"><strong className="text-yellow">Helpline / WhatsApp :</strong> +974 6660 5252</li>
                                    <li className="mb-2"><strong className="text-yellow">Support:</strong> support@kees.qa</li>
                                </ul>
                            </div>
                            <div className="footer_icon social_icon mb-4">
                                <ul className="list-unstyled">
                                    <li><Link href="#" className="single_social_icon"><i className="fab fa-facebook-f"></i></Link></li>
                                    <li><Link href="#" className="single_social_icon"><i className="fab fa-twitter"></i></Link></li>
                                    <li><Link href="#" className="single_social_icon"><i className="fas fa-globe"></i></Link></li>
                                    <li><Link href="#" className="single_social_icon"><i className="fab fa-behance"></i></Link></li>
                                    <li><Link href="#" className="single_social_icon"><i className="fab fa-whatsapp"></i></Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-2">
                            <div className="single_footer_part">
                                <h4>Information</h4>
                                <ul className="list-unstyled">
                                    <li><Link href="">About Us</Link></li>
                                    <li><Link href="">Checkout</Link></li>
                                    <li><Link href="">Contact</Link></li>
                                    <li><Link href="">Services</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-2">
                            <div className="single_footer_part">
                                <h4>My Account</h4>
                                <ul className="list-unstyled">
                                    <li><Link href="">My Account</Link></li>
                                    <li><Link href="">Contact</Link></li>
                                    <li><Link href="">Shpping Cart</Link></li>
                                    <li><Link href="">Shop</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-2">
                            <div className="single_footer_part">
                                <h4>Quick Shop</h4>
                                <ul className="list-unstyled">
                                    <li><Link href="">About Us</Link></li>
                                    <li><Link href="">Checkout</Link></li>
                                    <li><Link href="">Contact</Link></li>
                                    <li><Link href="">Services</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright_part">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="copyright_text">
                                    <p>© 2020 Kees All Right Reserveds.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <FooterCartDetail qty={5} price={140} />
            </footer>
        </Fragment>
    );

}


export default Footer;
