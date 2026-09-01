'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import { SidebarNav } from './sidebar-nav';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Off-canvas nav for screens below `lg`, where the fixed Sidebar is hidden. */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[240px] gap-0 border-none bg-shell p-0 sm:max-w-[240px]"
      >
        {/* Visually redundant with the logo — present for screen readers only. */}
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarNav onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
