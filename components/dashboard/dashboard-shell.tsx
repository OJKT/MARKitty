import Link from "next/link";

  <div className="py-6 pr-6 lg:py-8">
    <nav className="grid items-start gap-2">
      <div className="text-sm font-medium text-muted-foreground mb-4">Teaching</div>
      <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-primary">
        Dashboard
      </a>
      <a href="/rubrics/new" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Create Rubric
      </a>
      <a href="/dashboard/rubrics/view" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        View Rubrics
      </a>
      <a href="/dashboard/assignments" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Assignments
      </a>
      <a href="/dashboard/students" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Students
      </a>
      <a href="/dashboard/classes" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Classes
      </a>
      
      <div className="text-sm font-medium text-muted-foreground mt-6 mb-4">Content</div>
      <a href="/dashboard/templates" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Templates
      </a>
      <a href="/dashboard/comments" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Comment Library
      </a>
      
      <div className="text-sm font-medium text-muted-foreground mt-6 mb-4">Account</div>
      <a href="/settings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Settings
      </a>
      <a href="/help" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        Help & Support
      </a>
    </nav>
  </div> 