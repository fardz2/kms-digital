import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { readSession } from "../features/auth/session-storage";
import { ROLE_HOME } from "../features/auth/roleHome";

const PUBLIC_ROUTES = ["/sign-in", "/"];

// Legacy useAuth — retained for pages that haven't migrated to useSession.
// Reads from the same storage as useSession (kms_session_v1) via readSession(),
// which also handles one-time migration from the old login_data key.
const useAuth = (expectedRole) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => readSession(), []);

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(location.pathname)) return;

    const isDetailRoute = location.pathname.startsWith(
      "/tenaga-kesehatan/detail/"
    );

    if (!user) {
      navigate("/masuk", {
        replace: true,
        state: { error: "Silakan login terlebih dahulu." },
      });
      return;
    }

    const userRole = user.user.role;

    if (expectedRole && userRole !== expectedRole) {
      if (
        isDetailRoute &&
        (userRole === "ORANG_TUA" || userRole === "TENAGA_KESEHATAN")
      ) {
        return;
      }

      const redirectPath = ROLE_HOME[userRole] ?? "/masuk";
      navigate(redirectPath, {
        replace: true,
        state: {
          error: `Akses ditolak. Anda bukan ${expectedRole
            .replace("_", " ")
            .toLowerCase()}.`,
        },
      });
    }
  }, [user, navigate, expectedRole, location.pathname]);

  return user;
};

export default useAuth;
