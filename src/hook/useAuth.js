import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

const useAuth = (expectedRole) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define public routes that don't require authentication
  const publicRoutes = ["/sign-in", "/"];

  // Compute user data with useMemo to avoid recalculation
  const user = useMemo(() => {
    try {
      if (typeof window !== "undefined") {
        const loginDataStr = localStorage.getItem("login_data");
        if (!loginDataStr) return null;
        const loginData = JSON.parse(loginDataStr);
        if (loginData?.token?.value && loginData?.user?.role) {
          return loginData;
        }
        return null;
      }
    } catch (error) {
      console.error("Gagal mem-parsing data login:", error);
      localStorage.clear(); // Clear corrupted data
    }
    return null;
  }, []); // Empty dependency array since localStorage is read once on mount

  useEffect(() => {
    // Skip authentication for public routes
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    // Allow ORANG_TUA and TENAGA_KESEHATAN to access /tenaga-kesehatan/detail/:id
    const isDetailRoute = location.pathname.startsWith(
      "/tenaga-kesehatan/detail/"
    );

    if (!user) {
      localStorage.clear();
      navigate("/sign-in", {
        replace: true,
        state: { error: "Silakan login terlebih dahulu." },
      });
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
        // Special case: Allow ORANG_TUA and TENAGA_KESEHATAN for detail route
        if (
          isDetailRoute &&
          (userRole === "ORANG_TUA" || userRole === "TENAGA_KESEHATAN")
        ) {
          return; // Allow access
        }

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
  }, [user, navigate, expectedRole, location.pathname]);

  return user;
};

export default useAuth;
