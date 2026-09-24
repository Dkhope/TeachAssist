import { Download, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportToPdf, useFavourites, type SavedItem } from "@/lib/storage";

export function ResultActions({
  tool,
  title,
  content,
}: {
  tool: SavedItem["tool"];
  title: string;
  content: string;
}) {
  const { add } = useFavourites();

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          add({ tool, title, content });
          toast.success("Saved to favourites");
        }}
      >
        <Star className="size-4" /> Save
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPdf}>
        <Download className="size-4" /> Export PDF
      </Button>
    </div>
  );
}
