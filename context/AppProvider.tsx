"use client";
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";
import { MessageProvider } from "./MessageContext";
import { AdminProvider } from "./AdminContext";
import { PartnershipProvider } from "./PartnershipContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostProvider>
        <MessageProvider>
          <AdminProvider>
            <PartnershipProvider>{children}</PartnershipProvider>
          </AdminProvider>
        </MessageProvider>
      </PostProvider>
    </AuthProvider>
  );
}
