"use client";

import { RubricForm } from "@/components/rubric/RubricForm";

export default function NewRubricPage() {
  const userId = 'CURRENT_USER_ID'; // Replace with actual auth context

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Rubric</h1>
      <RubricForm userId={userId} />
    </div>
  );
} 