import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AIAssistantButton } from "../ai/AIAssistantButton";
import { useAppContext } from "@/contexts/AppContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Bell, MagnifyingGlass, Sun, Moon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  title?: string;
}

export function Layout({ children, showSidebar = true, title }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences } = useAppContext();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show sidebar on landing page or auth pages
  const isPublicPage = location.pathname === "/" || location.pathname === "/auth";
  const shouldShowSidebar = showSidebar && !isPublicPage;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {shouldShowSidebar && <AppSidebar />}

      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col w-full",
          shouldShowSidebar && !isMobile && (preferences.sidebarCollapsed ? "pl-[72px]" : "pl-64"),
          shouldShowSidebar && isMobile && "pl-0"
        )}
      >
        {/* Top Header */}
        {!isPublicPage && (
          <header className={cn(
            "h-14 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30",
            shouldShowSidebar && isMobile && "pl-4"
          )}>
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Spacer for fixed mobile sidebar button in AppSidebar */}
              {shouldShowSidebar && isMobile && <div className="w-10 h-10" />}
              
              {title && (
                <h1 className="text-lg lg:text-xl font-bold tracking-tight truncate max-w-[150px] sm:max-w-none">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search */}
              <div className="relative w-32 sm:w-48 lg:w-96 hidden md:block">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-muted/50 border-none h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 lg:h-9 lg:w-9"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 lg:h-9 lg:w-9 rounded-full"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-2 border-background">
                  3
                </Badge>
              </Button>

              {/* User */}
              <div className="h-6 w-px bg-border mx-1 hidden md:block" />
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 hover:bg-muted/50 p-1 rounded-full transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl(user?.avatar_url)} alt={user?.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {user?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left text-[10px] leading-tight">
                  <p className="font-bold truncate max-w-[80px]">{user?.full_name?.split(' ')[0] || "Student"}</p>
                </div>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 p-3 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <AIAssistantButton />
    </div>
  );
}
