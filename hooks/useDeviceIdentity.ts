"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user-store";
import { getOrCreateDeviceId } from "@/lib/device-identity";

export function useDeviceIdentity() {
  const { init, isLoading, user, isOnboarded } = useUserStore();

  useEffect(() => {
    getOrCreateDeviceId();
    init();
  }, [init]);

  return { isLoading, user, isOnboarded };
}
