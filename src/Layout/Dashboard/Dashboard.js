import React, { Suspense } from "react";
import { renderRoutes } from "react-router-config";
import PropTypes from "prop-types";
import Footer from "../Guest/Components/Footer";
// import Footer from "../../Components/Footer/Footer";
// import Navbar from "../../Components/Navbar/Navbar";
// import Sidebar from "../../Components/Sidebar/Sidebar";
// import Topbar from "../../Components/TopBar/Topbar";
// import LocationModal from "../../Components/Modal/LocationModal/LocationModal";



const Dashboard = (props) => {
  const { route } = props;
  const loading = () => {
    return <div className="animated fadeIn pt-1 text-center">Loading...</div>;
  };
  return (


    <Suspense fallback={loading()}>
      {renderRoutes(route.routes)}
    </Suspense>


  );
};

Dashboard.propTypes = {
  route: PropTypes.object,
};

export default Dashboard;
