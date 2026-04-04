import { getVersion } from "@tauri-apps/api/app";
import { useState, useEffect } from "react";

export function useAppVersion() {
  const [version, setVersion] = useState<string>();

  useEffect(() => {
    const fetchVersion = async () => {
      const v = await getVersion();
      setVersion(v);
    };
    fetchVersion();
  }, []);

  return version;
}
