import React, { useContext } from "react";
import { ShortcutsContext } from "./Shortcuts.control";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ShortcutsComponent() {
  const { shortcuts } = useContext(ShortcutsContext);

  return (
    <div className="flex-1 p-6">
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Keyboard Shortcuts
        </h2>
        <p className="text-sm text-muted-foreground">
          Boost your speed with these shortcuts. Press Shift + ? anytime to open
          this page.
        </p>
      </div>
      <Separator />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {shortcuts.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No shortcuts registered.
          </div>
        )}
        {shortcuts.map((s, idx) => (
          <Card key={idx} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-base font-medium">
                  {s.description || "Action"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {s.scope || "Global"}
                </div>
              </div>
              <kbd className="rounded border bg-muted px-2 py-1 text-xs font-mono">
                {s.combo}
              </kbd>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ShortcutsComponent;
