import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const useAuth = (expectedRole) => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      if (typeof window !== "undefined") {
        const loginDataStr = localStorage.getItem("login_data");
        if (!loginDataStr) return null;
        const loginData = JSON.parse(loginDataStr);
        if (loginData?.token?.value && loginData?.user?.role) {
          return loginData;
        }
      }
    } catch (error) {
      console.error("Gagal mem-parsing data login:", error);
    }
    return null;
  })();

  useEffect(() => {
    if (!user) {
      localStorage.clear();
      navigate("/sign-in", { replace: true });
    } else {
      const userRole = user.user.role;

      // Define role-specific dashboard paths
      const roleDashboards = {
        ORANG_TUA: "/dashboard",
        KADER_POSYANDU: "/kader-posyandu/dashboard",
        TENAGA_KESEHATAN: "/tenaga-kesehatan/dashboard",
        DESA: "/desa/dashboard",
        ADMIN: "/admin/dashboard/desa",
      };

      // If an expected role is provided, validate it
      if (expectedRole && userRole !== expectedRole) {
        // Redirect to the user's role-specific dashboard if role doesn't match
        const redirectPath = roleDashboards[userRole] || "/sign-in";
        navigate(redirectPath, {
          replace: true,
          state: {
            error: `Akses ditolak. Anda bukan ${expectedRole
              .replace("_", " ")
              .toLowerCase()}.`,
          },
        });
      }
    }
  }, [user, navigate, expectedRole]);

  return user;
};

export default useAuth;
