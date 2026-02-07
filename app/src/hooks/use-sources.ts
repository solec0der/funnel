"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeSources } from "@/lib/firebase/sources";
import type { Source } from "@/lib/types";

export function useSources() {
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSources([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeSources(user.uid, (data) => {
      setSources(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { sources, loading };
}
