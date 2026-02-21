"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribe } from "@/lib/networkActivity";
import { UI_TEXT } from "@/lib/i18n";

const SHOW_DELAY_MS = 150;
const HIDE_DELAY_MS = 220;
const MIN_VISIBLE_MS = 320;

export function GlobalLoadingOverlay() {
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [visibleSince, setVisibleSince] = useState<number | null>(null);

  useEffect(() => subscribe(setPendingCount), []);

  useEffect(() => {
    let timer = 0;

    if (pendingCount <= 0) {
      const elapsedVisible = visibleSince ? Date.now() - visibleSince : 0;
      const minRemain = Math.max(0, MIN_VISIBLE_MS - elapsedVisible);
      const hideAfter = Math.max(HIDE_DELAY_MS, minRemain);

      timer = window.setTimeout(() => {
        setVisible(false);
        setVisibleSince(null);
      }, hideAfter);
      return () => window.clearTimeout(timer);
    }

    if (visible) return;

    timer = window.setTimeout(() => {
      setVisible(true);
      setVisibleSince(Date.now());
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pendingCount, visible, visibleSince]);

  const shouldRender = useMemo(() => visible, [visible]);
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
