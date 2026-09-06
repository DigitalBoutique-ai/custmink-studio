"use client";

import { SignOutButton } from "@clerk/nextjs";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { type ClaimResult, claimSeat } from "@/lib/auth/claim";

const MESSAGES: Record<Exclude<ClaimResult, { ok: true }>["reason"], string> = {
  none: "No seat has been set up for this email yet. Ask your organization owner to add you, then try again.",
  conflict: "This seat is already linked to a different sign-in. Ask your organization owner to check it.",
  unverified: "Your email address is not verified yet. Verify it with the link Clerk sent you, then try again.",
};

export function ClaimForm() {
  const [result, action, pending] = useActionState(async () => claimSeat(), null);

  return (
    <form action={action} className="public-actions">
      {result && !result.ok ? <p className="public-error">{MESSAGES[result.reason]}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Claim my seat"}
      </Button>
      <SignOutButton redirectUrl="/sign-in">
        <button type="button" className="public-link">
          Sign in with a different account
        </button>
      </SignOutButton>
    </form>
  );
}
