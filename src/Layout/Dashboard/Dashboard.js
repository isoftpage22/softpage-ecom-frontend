import React, { Suspense } from "react";
import { renderRoutes } from "react-router-config";
import PropTypes from "prop-types";
import Footer from "../../Components/Footer/Footer";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Topbar from "../../Components/TopBar/Topbar";
import LocationModal from "../../Components/Modal/LocationModal/LocationModal";



const Dashboard = (props) => {
  const { route} = props;
  const loading = () => {
    return <div className="animated fadeIn pt-1 text-center">Loading...</div>;
  };
  return (
    <body>
      
          <Topbar />
          <div className="container-fluid page-body-wrapper">
            <Navbar
            />
            {/* <Sidebar/> */}
            <div className="main-panel">
              <div className="content-wrapper">
                <Suspense fallback={loading()}>
                  {renderRoutes(route.routes)}
                </Suspense>
              </div>
              
              <Footer />
            </div>
          </div>
        </body>
   
  );
};

Dashboard.propTypes = {
  route: PropTypes.object,
};

export default Dashboard;
