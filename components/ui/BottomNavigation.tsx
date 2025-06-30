import Link from "next/link";
import { Home, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function BottomNavigation() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 border-t-2 border-cyan-400 backdrop-blur-md flex justify-around items-center h-16">
            <Link href="/" className="flex flex-col items-center justify-center flex-1 py-2 transition-colors hover:text-yellow-300 text-white">
                <Home className={`w-6 h-6 mb-1 ${pathname === "/" ? "text-yellow-300" : ""}`} />
                <span className={`text-xs font-comic ${pathname === "/" ? "text-yellow-300" : ""}`}>Home</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center flex-1 py-2 transition-colors hover:text-yellow-300 text-white">
                <User className={`w-6 h-6 mb-1 ${pathname.startsWith("/profile") ? "text-yellow-300" : ""}`} />
                <span className={`text-xs font-comic ${pathname.startsWith("/profile") ? "text-yellow-300" : ""}`}>Profile</span>
            </Link>
        </nav>
    );
} 