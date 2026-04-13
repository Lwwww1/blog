"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    PagefindUI?: new (options: Record<string, unknown>) => unknown;
  }
}

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.replace(/\/+$/, "")
    : "";

const scriptPath = `${basePath}/pagefind/pagefind-ui.js`;
const stylePath = `${basePath}/pagefind/pagefind-ui.css`;
const bundlePath = `${basePath}/pagefind/`;

const loadStylesheet = (): void => {
  const existing = document.querySelector<HTMLLinkElement>(
    "link[data-pagefind-style]",
  );
  if (existing) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = stylePath;
  link.setAttribute("data-pagefind-style", "true");
  document.head.appendChild(link);
};

const loadScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-pagefind-script]",
    );
    if (existing) {
      if (window.PagefindUI) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Load failed")), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = scriptPath;
    script.async = true;
    script.setAttribute("data-pagefind-script", "true");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Load failed")), {
      once: true,
    });
    document.body.appendChild(script);
  });

export const PagefindSearch = () => {
  const initialized = useRef(false);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      loadStylesheet();
      await loadScript();

      if (!alive || initialized.current || !window.PagefindUI) {
        return;
      }

      initialized.current = true;
      new window.PagefindUI({
        element: "#search",
        bundlePath,
        showSubResults: true,
        resetStyles: false,
        translations: {
          placeholder: "Search by title, summary, or tag...",
        },
      });
    };

    init().catch((error) => {
      // Avoid crashing the page on script loading errors.
      console.error("Pagefind failed to initialize:", error);
    });

    return () => {
      alive = false;
    };
  }, []);

  return <div id="search" />;
};
