import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../Layout/Main/Main";
import SignIn from "../Pages/Auth/SignIn/SignIn";
import ForgatePassword from "../Pages/Auth/ForgatePassword/ForgatePassword";
import VerifyCode from "../Pages/Auth/VerifyCode/VerifyCode";
import NewPass from "../Pages/Auth/NewPass/NewPass";
import AboutUs from "../Pages/Settings/AboutUS/AboutUs";
import PrivacyPolicy from "../Pages/Settings/PrivacyPolicy/PrivacyPolicy";
import TermsCondition from "../Pages/Settings/TermsCondition/TermsCondition";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Pages/Dashboard/Dashboard";
import ProfilePage from "../Pages/AdminProfile/ProfilePage";
import Notifications from "../Pages/Notifications/Notifications";
import AnalysisPage from "../Pages/Analysis/AnalysisPage";
import Subscriptions from "../Pages/Subscriptions/Subscriptions";
import QrTokensAll from "../Pages/Subscriptions/QrTokensAll";
import Analysis from "../Pages/Analysis/Analysis";
import RestaurantRequest from "../Pages/RestaurantRequest/RestaurantRequest";
import RestaurantManagement from "../Pages/Restaurants/RestaurantManagement";
import RestaurantView from "../Pages/Restaurants/RestaurantView";
import RestaurantEdit from "../Pages/Restaurants/RestaurantEdit";
import RestaurantPackages from "../Pages/Restaurants/RestaurantPackages";
import RestaurantPackageFlags from "../Pages/Restaurants/RestaurantPackageFlags";
import RestaurantPlacements from "../Pages/Restaurants/RestaurantPlacements";
import UserList from "../Pages/UserList/UserList";
import UserDetail from "../Pages/UserList/UserDetail";
import Earnings from "../Pages/Earnings/Earnings";
import DailyRewards from "../Pages/DailyRewards/DailyRewards";
import Categories from "../Pages/Categories/Categories";
import Reports from "../Pages/Reports/Reports";
import Settings from "../Pages/Settings/Settings";
import AllMessages from "../Pages/Messages/AllMessages";
import BlockedList from "../Pages/BlockedList/BlockedList";
import ChangePass from "../Pages/AdminProfile/ChangePass";

import EventCreators from "../Pages/EventCreator/EventCreators";
import EventCreatorDetails from "../Pages/EventCreator/EventCreatorDetails";
import AdminManagementPage from "../Pages/Admin/Admin";
import MakeAdmin from "../Pages/MakeAdmin/MakeAdmin";
import RoutesManagement from "../Pages/RoutesManagement/RoutesManagementV2";
import NotificationCampaign from "../Pages/NotificationCampaign/NotificationCampaign";
import Challenges from "../Pages/Challenges/Challenges";

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/forgate-password",
    element: <ForgatePassword />,
  },
  {
    path: "/verify-code",
    element: <VerifyCode />,
  },
  {
    path: "/new-password",
    element: <NewPass />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/user-list", element: <UserList /> },
          { path: "/users/:id", element: <UserDetail /> },
          { path: "/blocked-users", element: <BlockedList /> },
          { path: "/block-list", element: <BlockedList /> },
          { path: "/earnings", element: <Earnings /> },
          { path: "/daily-rewards", element: <DailyRewards /> },
          { path: "/restaurant-request", element: <RestaurantManagement /> },
          { path: "/restaurants", element: <RestaurantManagement /> },
          { path: "/restaurants/:id", element: <RestaurantView /> },
          { path: "/restaurants/:id/edit", element: <RestaurantEdit /> },
          { path: "/restaurants/packages", element: <RestaurantPackages /> },
          { path: "/restaurants/package-flags", element: <RestaurantPackageFlags /> },
          { path: "/restaurants/placements", element: <RestaurantPlacements /> },
          { path: "/analysis-page", element: <AnalysisPage /> },
          { path: "/analysis/:id", element: <Analysis /> },
          { path: "/subscriptions", element: <Subscriptions /> },
          { path: "/subscriptions/all", element: <QrTokensAll /> },
          { path: "/admins", element: <AdminManagementPage /> },
          { path: "/create-admin", element: <MakeAdmin /> },
          { path: "/categories", element: <Categories /> },
          { path: "/reports", element: <Reports /> },
          // { path: "/ads-setup", element: <AdsSetup /> },
          // { path: "/activity&events", element: <ActivityEvents /> },
          { path: "/event-creator", element: <EventCreators /> },
          { path: "/event-creator/:id", element: <EventCreatorDetails /> },
          { path: "/notifications", element: <Notifications /> },
          { path: "/notification-campaign", element: <NotificationCampaign /> },
          { path: "/challenges", element: <Challenges /> },
          { path: "/routes-management", element: <RoutesManagement /> },
          { path: "/settings", element: <Settings /> },
          { path: "/settings/about-us", element: <AboutUs /> },
          { path: "/settings/privacy-policy", element: <PrivacyPolicy /> },
          { path: "/settings/terms-condition", element: <TermsCondition /> },
          { path: "/settings/profile", element: <ProfilePage /> },
          { path: "/settings/change-password", element: <ChangePass /> },
          { path: "/messages", element: <AllMessages /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
