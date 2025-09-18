"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/features/auth/hooks/use-user";

export const UserButton = () => {
  const { user, signOut, getUserInitials, getDisplayName } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent">
        <Avatar className="h-9 w-9 border">
          <AvatarImage
            alt={`${getDisplayName(user)} avatar`}
            src={user?.image || undefined}
          />
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-1 flex-col text-start sm:flex">
          <span className="truncate font-medium text-sm">
            {getDisplayName(user)}
          </span>
          {user?.email && (
            <span className="truncate text-muted-foreground text-xs">
              {user.email}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="space-y-1 px-2 py-1.5">
          <p className="font-semibold text-sm leading-tight">
            {getDisplayName(user)}
          </p>
          {user?.email && (
            <p className="text-muted-foreground text-xs">{user.email}</p>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link className="flex items-center gap-2" href="/settings/profile">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link className="flex items-center gap-2" href="/settings">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={async (event) => {
            event.preventDefault();
            await signOut();
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
