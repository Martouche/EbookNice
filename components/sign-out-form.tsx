"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { clearOfflinePages } from "./service-worker";

export function SignOutForm({ label }: { label: string }) {
  return (
    <form action={signOut} onSubmit={clearOfflinePages}>
      <Button variant="ghost" type="submit">
        <LogOut />
        {label}
      </Button>
    </form>
  );
}
