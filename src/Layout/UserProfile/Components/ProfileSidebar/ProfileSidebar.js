import React from 'react'
import {NavLink} from 'react-router-dom';

const ProfileSidebar = (props) => {
    const {userProfile} = props;
    return (
        <div className="left_sidebar_area">
        <div className="row">
          <div className="col-lg-12 mb-3 px-4">
            <h3>{userProfile && userProfile.name}</h3>
            <p>{userProfile && userProfile.mobile}</p>
            <p>{userProfile && userProfile.email}</p>
          </div>
        </div>
        <aside className="left_widgets p_filter_widgets">
          <div className="l_w_title">
            <h3>Profile Details</h3>
          </div>
          <div className="widgets_inner profile_nav">
            <ul className="list">
              <li>
                <NavLink to="/user-profile/my-profile"  activeClassName="active"><i className="ti-user" />  My Profile</NavLink>
              </li>
              <li>
                <NavLink to="/user-profile/my-order" activeClassName="active"><i className="ti-shopping-cart" />  Order Details</NavLink>
              </li>
              <li>
                <NavLink to="/user-profile/favorite-products" activeClassName="active"><i className="ti-heart" />  Favorites Products</NavLink>
              </li>
              {/* <li>
                <NavLink to="/user-profile/payment-detail" activeClassName="active"><i className="ti-credit-card" />  Payments Details</NavLink>
              </li> */}
              <li>
                <NavLink to="/user-profile/our-addresses" activeClassName="active"><i className="ti-map-alt" />  My Addresses</NavLink>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    )
}

export default ProfileSidebar
