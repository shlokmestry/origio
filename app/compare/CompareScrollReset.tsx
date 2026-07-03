"use client";

import { useEffect } from "react";

export default function CompareScrollReset() {
  useEffect(() => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }, []);

  return null;
}
