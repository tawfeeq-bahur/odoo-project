"use client";

import React from "react";
import { useSharedState } from "@/components/AppLayout";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus,
  Search,
  MapPin,
  MoreHorizontal,
  ChevronRight,
  Users,
  Pin,
  Zap,
  Calendar,
  Globe,
  Wallet,
  Clock,
  TrendingUp,
  Route,
  Compass,
} from "lucide-react";
import Link from "next/link";

function safeFormatDate(dateStr: string | undefined): string {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "TBD";
  }
}

export function RightPanel() {
  const { user, packages, expenses } = useSharedState();
  const { t } = useLanguage();

  if (!user) return null;

  const organizedTours = packages.filter(
    (p) => p.organizerName === user.username
  );
  const joinedTours = packages.filter(
    (p) =>
      p.members.some(
        (member) =>
          (typeof member === "string" ? member : member.name) === user.username
      ) && p.organizerName !== user.username
  );
  const allMyTours = [...organizedTours, ...joinedTours];
  const totalMembers = organizedTours.reduce(
    (sum, tour) => sum + (tour.members?.length || 0),
    0
  );
  const userExpenses = expenses.filter(
    (e) => e.submittedBy === user.username
  );
  const pendingExpenses = userExpenses.filter((e) => e.status === "pending");
  const approvedTotal = userExpenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  const upcomingTours = packages
    .filter(
      (p) =>
        p.status === "Up-Coming" &&
        (p.organizerName === user.username ||
          p.members?.some(
            (m) => (typeof m === "string" ? m : m.name) === user.username
          ))
    )
    .slice(0, 3);

  const ongoingTours = packages
    .filter(
      (p) =>
        p.status === "Ongoing" &&
        (p.organizerName === user.username ||
          p.members?.some(
            (m) => (typeof m === "string" ? m : m.name) === user.username
          ))
    )
    .slice(0, 3);

  const pinnedDestinations = [
    ...new Set(organizedTours.map((t) => t.destination)),
  ].slice(0, 4);

  return (
    <aside className="hidden xl:flex xl:flex-col w-[320px] min-w-[320px] border-l bg-background h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Compass className="h-4 w-4 text-primary" />
        <div>
          <h3 className="font-semibold text-sm">{t("Details")}</h3>
          <p className="text-xs text-muted-foreground">
            #{user.username.toLowerCase()}-travel
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-6 py-4 px-4">
        <Link href="/members" className="flex flex-col items-center gap-1 group">
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
            <UserPlus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground">{t("Add")}</span>
        </Link>
        <Link href="/guide" className="flex flex-col items-center gap-1 group">
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground">{t("Find")}</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center gap-1 group">
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
            <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground">{t("Calendar")}</span>
        </Link>
        <Link href="/reports" className="flex flex-col items-center gap-1 group">
          <div className="h-10 w-10 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground">{t("More")}</span>
        </Link>
      </div>

      <Separator />

      {/* About Section */}
      <div className="px-4 py-3">
        <h4 className="font-semibold text-sm mb-3">{t("About")}</h4>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t("Role")}</p>
            <p className="text-sm">{t("Tour Organizer & Traveler")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t("Description")}</p>
            <p className="text-sm">
              {organizedTours.length > 0
                ? t(`Managing ${organizedTours.length} tour${organizedTours.length > 1 ? "s" : ""} across ${[...new Set(organizedTours.map((t) => t.destination))].join(", ")}`)
                : t("Ready to plan your next adventure!")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={`https://placehold.co/32x32.png?text=${user.username.substring(0, 2).toUpperCase()}`} />
              <AvatarFallback className="text-[10px]">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{t("Active since January 2026")}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Members */}
      <Link href="/members" className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Members")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{totalMembers}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>

      <Separator />

      {/* Active Tours */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Active Tours")}</span>
        </div>
        <div className="flex items-center gap-2">
          {ongoingTours.length > 0 && (
            <Badge variant="default" className="h-5 text-[10px] px-1.5">
              {ongoingTours.length}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{allMyTours.length}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Separator />

      {/* Pinned Destinations */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <Pin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Pinned Destinations")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{pinnedDestinations.length}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Separator />

      {/* Quick Shortcuts */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Quick Shortcuts")}</span>
        </div>
        <div className="space-y-1">
          <Link href="/guide" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group">
            <Route className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground">{t("Plan a Route")}</span>
          </Link>
          <Link href="/scanner" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group">
            <Wallet className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground">{t("Log Expense")}</span>
          </Link>
          <Link href="/sos" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group">
            <Zap className="h-4 w-4 text-muted-foreground group-hover:text-destructive" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground">{t("Emergency SOS")}</span>
          </Link>
        </div>
      </div>

      <Separator />

      {/* Recent Activity */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Recent Activity")}</span>
        </div>
        <div className="space-y-3">
          {userExpenses.slice(0, 4).map((exp) => (
            <div key={exp.id} className="flex items-start gap-3">
              <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                exp.status === "approved" ? "bg-green-500" : exp.status === "pending" ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{exp.description}</p>
                <span className="text-xs text-muted-foreground">
                  ₹{exp.amount.toLocaleString()} · {exp.type} ·{" "}
                  <Badge variant={exp.status === "approved" ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                    {exp.status}
                  </Badge>
                </span>
              </div>
            </div>
          ))}
          {userExpenses.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">{t("No recent activity")}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Upcoming Tours Preview */}
      {upcomingTours.length > 0 && (
        <>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("Upcoming Tours")}</span>
            </div>
            <div className="space-y-2">
              {upcomingTours.map((tour) => (
                <Link key={tour.id} href={`/tours/${tour.id}`} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group">
                  <MapPin className="h-4 w-4 text-primary/70 group-hover:text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary">{tour.name}</p>
                    <p className="text-xs text-muted-foreground">{tour.destination} · {tour.durationDays} days</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                    {safeFormatDate(tour.startDate)}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Budget Overview Mini */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("Budget Snapshot")}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("Approved")}</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">₹{approvedTotal.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-xs text-muted-foreground">{t("Pending")}</p>
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{pendingExpenses.length} items</p>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </aside>
  );
}
