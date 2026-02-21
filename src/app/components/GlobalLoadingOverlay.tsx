"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribe } from "@/lib/networkActivity";
import { UI_TEXT } from "@/lib/i18n";

const SHOW_DELAY_MS = 150;

export function GlobalLoadingOverlay() {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribe(setPendingCount), []);

  useEffect(() => {
    let timer = 0;

    if (pendingCount <= 0) {
      timer = window.setTimeout(() => {
        setVisible(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pendingCount]);

  const shouldRender = useMemo(() => visible && pendingCount > 0, [visible, pendingCount]);
  if (!shouldRender) return null;

  return (
    <div className="global-loader-overlay" role="status" aria-live="polite" aria-label={UI_TEXT.common.loading}>
      <div className="global-loader-content">
        <span className="global-loader-pill" aria-hidden="true" />
        <p className="meta text-muted-foreground">{UI_TEXT.common.loading}</p>
      </div>
    </div>
  );
}
