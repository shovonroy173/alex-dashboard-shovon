import brandlogo from "../../assets/image/logo.svg";

const AuthShell = ({ children, compact = false }) => {
  return (
    <div className="min-h-screen bg-[#f4f4f5] px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[940px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#4450dd_0%,#6574f3_100%)] px-7 py-10 shadow-[0_28px_60px_rgba(67,85,221,0.18)] md:px-16 md:py-14">
          <div
            className={`mx-auto flex w-full flex-col text-white ${
              compact ? "max-w-[652px]" : "max-w-[760px]"
            }`}
          >
            <div className="mb-10 flex justify-center md:mb-12">
              <img
                src={brandlogo}
                alt="Food Route"
                className="h-auto w-[180px] md:w-[220px]"
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
