"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading } = useContext(AuthContext); // ← ADD loading
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token) return null;
  return <>{children}</>;
}
