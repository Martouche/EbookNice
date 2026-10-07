import type { ReactNode } from "react";

export const UPDATED_AT = { fr: "7 octobre 2026", en: "7 October 2026" };
export const CONTACT = "martin.vantalon@gmail.com";

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-line pt-8">
      <h2 className="font-display text-3xl leading-tight text-balance">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
