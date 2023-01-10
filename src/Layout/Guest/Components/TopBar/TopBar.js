import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from "../../../../utils/token";

const TopBar = ({ openLogin }) => {
    const openLoginModal = () => openLogin();

    return (
        <Fragment>
            <header className="main_menu home_menu">
                <div className="top_nav">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-6 col-md-6">
                                <div className="top_nav_left"><i className="ti-location-pin"></i> <a href="#">Select your location</a></div>
                            </div>
                            <div className="col-sm-6 col-md-6 d-sm-block">
                                <div className="top_nav_right">
                                    <ul className="top_nav_menu">
                                        <li className="currency">
                                            <a href="#">
                                                Currency
										<i className="fa fa-angle-down"></i>
                                            </a>
                                            <ul className="currency_selection">
                                                <li><a href="#">QAR</a></li>
                                                <li><a href="#">INR</a></li>
                                            </ul>
                                        </li>
                                        <li className="language">
                                            <a href="#">
                                                Language
										<i className="fa fa-angle-down"></i>
                                            </a>
                                            <ul className="language_selection">
                                                <li><a href="#">English</a></li>
                                                <li><a href="#">Arabic</a></li>
                                            </ul>
                                        </li>
                                        <li className="account">
                                            <a href="my-account.html">
                                                Welcome - Sabina
                                    </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-12">
                            <nav className="navbar navbar-expand-lg navbar-light">
                                <Link to="/" className="navbar-brand" href="index.html"> <img src="/assets/img/logo.svg" alt="logo" className="mainlogo" /> </Link>
                                {/* <Link to="/" className="navbar-brand d-sm-none d-md-none d-lg-block" href="index.html"> <img src="/assets/img/logo.jpg" alt="logo" /> </Link> */}
                                <button className="navbar-toggler" type="button" data-toggle="collapse"
                                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                    <span className="menu_icon"><i className="fas fa-bars"></i></span>
                                </button>

                                <div className="collapse navbar-collapse main-menu-item" id="navbarSupportedContent">
                                    <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <Link to="/" className="nav-link" href="index.html">Home</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/category" className="nav-link" href="index.html">Shop Now</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" href="#">Sell Your Product</Link>
                                        </li>

                                        <li className="nav-item">
                                            <Link className="nav-link" href="#">Contact</Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="hearer_icon d-flex">
                                    <Link id="search_1"><i className="ti-search"></i></Link>
                                    {/* <Link to={getToken() ? 'user-profile/my-profile' :''} onClick={!getToken() ? openLoginModal : ''} ><i className="ti-user"></i></Link> */}
                                    <Link to='/user-profile/my-profile' ><i className="ti-user"></i></Link>

                                    <Link href=""><i className="ti-settings"></i></Link>
                                    <div className="dropdown cart">
                                        <Link to="/cart-order-list" className="dropdown-toggle" href="#" 
                                        // id="navbarDropdown3" role="button"
                                        //     data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
                                            >
                                            <i className="fas fa-cart-plus"></i><span>99</span>
                                        </Link>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="search_input" id="search_input_box" style={{ display: "none" }}>
                    <div className="container ">
                        <form className="d-flex justify-content-between search-inner">
                            <input type="text" className="form-control" id="search_input" placeholder="Search Here" />
                            <button type="submit" className="btn"></button>
                            <span className="ti-close" id="close_search" title="Close Search"></span>
                        </form>
                    </div>
                </div>
            </header>
        </Fragment>
    );

}


export default TopBar;
