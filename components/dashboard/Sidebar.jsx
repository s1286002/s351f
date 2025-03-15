"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";

/**
 * Sidebar component for the dashboard
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @param {Array} props.navigationItems - Navigation items to display
 * @param {boolean} props.isMobile - Whether the sidebar is being rendered on mobile
 * @returns {JSX.Element} Sidebar component
 */
export default function Sidebar({ user, navigationItems, isMobile = false }) {
  const pathname = usePathname();

  // Initialize open submenus based on current path
  const initialOpenSubmenus = {};
  navigationItems.forEach((item) => {
    if (item.submenu && isSubmenuActive(item.submenu, pathname)) {
      initialOpenSubmenus[item.name] = true;
    }
  });

  const [openSubmenus, setOpenSubmenus] = useState(initialOpenSubmenus);

  const toggleSubmenu = (itemName) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Check if a submenu should be open based on current path
  function isSubmenuActive(submenuItems, path) {
    return submenuItems.some((item) => path === item.href);
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-4">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                // Item with submenu
                <div className="mb-1">
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isSubmenuActive(item.submenu, pathname)
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    {openSubmenus[item.name] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Submenu items */}
                  {openSubmenus[item.name] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === subItem.href
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular item without submenu
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  // For mobile, render the sidebar in a Sheet component
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden h-11 w-11">
            <Menu className="h-7 w-7" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, render the sidebar directly
  return (
    <aside className="hidden border-r bg-background md:block md:w-64">
      <SidebarContent />
    </aside>
  );
}
