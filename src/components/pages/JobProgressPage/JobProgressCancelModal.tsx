import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JobProgressCancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function JobProgressCancelModal({ open, onOpenChange, onConfirm }: JobProgressCancelModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anuluj zlecenie</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz anulować to zlecenie? Ta operacja nie może być cofnięta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Nie, kontynuuj
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Tak, anuluj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
