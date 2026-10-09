"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocalize } from "@/lib/i18n/client";

/** `next/link` qui préfixe automatiquement les liens internes par la langue (`/lieux/x` → `/en/lieux/x`). */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const localize = useLocalize();
  return <NextLink href={typeof href === "string" ? localize(href) : href} {...props} />;
}
