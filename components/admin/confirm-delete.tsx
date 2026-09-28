"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Formulaire de suppression avec confirmation native (action irréversible). */
export function ConfirmDelete({ action, label }: { action: () => Promise<void>; label: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Supprimer définitivement « ${label} » ?`)) e.preventDefault();
      }}
    >
      <Button size="icon" variant="ghost" type="submit" aria-label={`Supprimer ${label}`}>
        <Trash2 className="text-red-500" />
      </Button>
    </form>
  );
}
