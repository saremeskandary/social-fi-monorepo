import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AccessibleDialogProps {
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AccessibleDialog = ({
  title,
  description,
  trigger,
  children,
  footer,
  className,
  open,
  onOpenChange,
}: AccessibleDialogProps) => {
  const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof open === "boolean") {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      );
    }
    return <Dialog>{children}</Dialog>;
  };

  return (
    <DialogWrapper>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </DialogWrapper>
  );
};

export default AccessibleDialog;
