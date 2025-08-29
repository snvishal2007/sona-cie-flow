import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    name: string;
    role: string;
    email: string;
  };
  onLogout?: () => void;
  userName?: string;
}

export const Header = ({ user, onLogout, userName }: HeaderProps) => {
  return (
    <header className="bg-background border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-academic-navy">CIE Re-Test Portal</h1>
            <p className="text-sm text-academic-gray">
              {userName ? `Welcome, ${userName}` : "Sona College of Technology"}
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-academic-navy">{user.name}</p>
              <p className="text-xs text-academic-gray">{user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-academic-gray hover:text-academic-navy"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};