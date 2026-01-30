"use client";

import type { ReligionBranch } from "@/lib/prompt-types";
import { useLocale } from "@/context/locale";
import { Button } from "@/components/ui/button";

const branches: ReligionBranch[] = ["christian", "buddhist"];

type Props = { disabled?: boolean };

export function ReligionSwitcher(props: Props) {
  const { disabled = false } = props;
  const { religion, setReligion, t } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card/30 p-0.5">
      {branches.map((branch) => (
        <Button
          key={branch}
          type="button"
          variant={religion === branch ? "secondary" : "ghost"}
          size="sm"
          disabled={disabled}
          className="min-w-[4rem] font-medium text-muted-foreground transition-opacity disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer hover:text-foreground data-[state=active]:text-foreground"
          onClick={() => setReligion(branch)}
          aria-label={t(`religion.${branch}`)}
          aria-pressed={religion === branch}
        >
          {t(`religion.${branch}`)}
        </Button>
      ))}
    </div>
  );
}
