"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import api from "@/services/api";
import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="h-16 glass rounded-2xl mx-6 mt-6 mb-2 flex justify-between items-center px-6 sticky top-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Dashboard</h2>
      
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-xs">
                {unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <span className="text-xs text-gray-500">{unreadCount} unread</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map((n: any) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    className={`flex flex-col items-start p-4 cursor-pointer border-b last:border-b-0 ${!n.is_read ? 'bg-blue-50 dark:bg-slate-800' : ''}`}
                    onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                  >
                    <div className="flex justify-between w-full">
                      <span className="font-medium text-sm">{n.title}</span>
                      {!n.is_read && <span className="h-2 w-2 bg-blue-600 rounded-full"></span>}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{n.message}</span>
                    <span className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
