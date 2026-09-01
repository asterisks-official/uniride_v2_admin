import { SidebarNav } from './sidebar-nav';

/** Fixed, always-visible on large screens. Hidden below `lg` in favour of MobileSidebar. */
export function Sidebar() {
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col bg-shell lg:flex">
      <SidebarNav />
    </aside>
  );
}
