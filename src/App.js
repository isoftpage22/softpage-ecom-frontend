import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { renderRoutes } from "react-router-config";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// Internal imports
import history from "./Store/history/index";
import routes from "./Routes/Routes";
import PrivateRoute from "./Routes/PrivateRoutes";
import LoginRoute from "./Routes/LoginRoute";
// import ToastMessage from './Components/ToastMessage';
import Loader from './Components/Loader';
// import LoginModal from './Components/Modal/LoginModal/LoginModal';
// import LocationModal from './Components/Modal/LocationModal/LocationModal';
// import FinetuneLocation from './Components/Modal/FinetuneLocation';
// import { closeLogin,closeSignup ,openLogin ,openSignup, needGuestCartSyncFinish, needGuestCartSyncReset } from './Store/action/login';
// import { getUserProfile, clearCartData, deleteUserCart } from './Store/action/user'
// import { closeLocation, getDeliveryRange, openFinetuneLocation, closeFinetuneLocation, setUserLocation,checkDeliveryRequest } from './Store/action/location';
// import { showToastMessage, resetToastMessage, setStartLoader, setStopLoader } from './Store/action/loader';


// Style imports
import "./App.css";
import "./index.css";
import ItemCardAtCheckout from "./Container/ItemCardAtCheckout/ItemCardAtCheckout";
// import SignupModal from "./Components/Modal/SignupModal/SignupModal";
// import ReactGA from 'react-ga';
// import ReactPixel from 'react-facebook-pixel';
const options = {
  autoConfig: true, // set pixel's autoConfig
  debug: false, // enable logs
};
const resolvePrivateRoutes = (routes) => {
  if (routes && Array.isArray(routes)) {
    return routes.map((route) => {
      console.log(route,"routes")
      if (route.isPrivate) {
        route.render = (props) => (
          <PrivateRoute component={route.component} {...props} />
        );
      }
      if (route.isAuth) {
        route.render = (props) => (
          <LoginRoute   component={route.component} {...props} />
        );
      }
      if (route.routes) {
        resolvePrivateRoutes(route.routes);
      }
      return route;
    });
  }
};
function App(props) {
  const { } = props;
  return (
    <>
    {console.log(routes,"routes")}
    <Router history={history} basename={process.env.PUBLIC_URL}>
      {renderRoutes(resolvePrivateRoutes(routes))}
    </Router>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
  
  }
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
  
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
