"use client";

import Link from "next/link";

export function DashboardShell() {
  return (
    <div className="py-6 pr-6 lg:py-8">
      <nav className="grid items-start gap-2">
        <div className="text-sm font-medium text-muted-foreground mb-4">Teaching</div>
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-primary">
          Dashboard
        </Link>
        <Link href="/rubrics/new" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Create Rubric
        </Link>
        <Link href="/dashboard/rubrics/view" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          View Rubrics
        </Link>
        <Link href="/dashboard/assignments" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Assignments
        </Link>
        <Link href="/dashboard/students" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Students
        </Link>
        <Link href="/dashboard/classes" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Classes
        </Link>

        <div className="text-sm font-medium text-muted-foreground mt-6 mb-4">Content</div>
        <Link href="/dashboard/templates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Templates
        </Link>
        <Link href="/dashboard/comments" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Comment Library
        </Link>

        <div className="text-sm font-medium text-muted-foreground mt-6 mb-4">Account</div>
        <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Settings
        </Link>
        <Link href="/help" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
          Help & Support
        </Link>
      </nav>
    </div>
  );
}
