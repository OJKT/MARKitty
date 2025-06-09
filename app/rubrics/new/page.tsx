"use client";

import { RubricForm } from "@/components/rubric/RubricForm";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Add dynamic export to prevent static page generation
export const dynamic = 'force-dynamic';

export default function NewRubricPage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to home if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Rubric</h1>
      <RubricForm userId={user.id} />
    </div>
  );
} 