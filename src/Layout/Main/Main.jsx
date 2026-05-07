import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Drawer } from "antd";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Header from "../../Components/Sidebar/Header";

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const contentRef = useRef(null);

  const onClose = () => setOpen(false);
  const showDrawer = () => setOpen(true);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-dashboard-bg)]">
      <div className="fixed left-0 top-0 z-10 hidden h-full w-[22rem] p-6 lg:block">
        <Sidebar />
      </div>

      <Drawer placement="left" onClose={onClose} open={open} width={280}>
        <Sidebar closeDrawer={onClose} />
      </Drawer>

      <div className="flex h-full flex-1 flex-col lg:ml-[22rem]">
        <div className="fixed inset-x-0 top-0 z-20 bg-[var(--color-dashboard-bg)] px-4 py-5 sm:px-6 lg:left-[22rem] lg:right-0 lg:w-[calc(100%-22rem)] lg:px-6 ">
          <Header showDrawer={showDrawer} />
        </div>

        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 pb-6 pt-28 sm:px-6 sm:pt-[140px] lg:px-6"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
