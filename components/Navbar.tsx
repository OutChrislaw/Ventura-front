"use client";
import { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 bg-black z-50">
      <Link
        href="/feed"
        className="text-xl font-bold tracking-tight text-white"
      >
        VENTURA
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link
          href="/feed"
          className="text-gray-400 hover:text-white transition"
        >
          Feed
        </Link>
        <Link
          href="/messages"
          className="text-gray-400 hover:text-white transition relative"
        >
          Messages
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        {user && (
          <Link
            href={`/profile/${user.id}`}
            className="text-gray-400 hover:text-white transition"
          >
            {user.name}
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
