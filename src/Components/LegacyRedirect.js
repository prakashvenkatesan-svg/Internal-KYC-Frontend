import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LegacyRedirect = ({ to, hashMap = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const target = hashMap[location.hash] || to;
    navigate(target, { replace: true });
  }, [hashMap, location.hash, navigate, to]);

  return null;
};

export default LegacyRedirect;
