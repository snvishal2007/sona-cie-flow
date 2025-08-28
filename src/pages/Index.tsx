import { useState } from "react";
import { Header } from "@/components/Header";
import { RoleSelector } from "@/components/RoleSelector";
import { LoginForm } from "@/components/LoginForm";
import { StudentForm } from "@/components/StudentForm";

type AppState = "role-selection" | "login" | "dashboard";

interface User {
  name: string;
  role: string;
  email: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("role-selection");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setAppState("login");
  };

  const handleLogin = (credentials: { email: string; otp?: string }) => {
    // Simulate successful login
    const mockUsers: Record<string, User> = {
      student: {
        name: "Arjun Kumar",
        role: "Student",
        email: credentials.email
      },
      "class-teacher": {
        name: "Dr. Priya Sharma",
        role: "Class Teacher",
        email: credentials.email
      },
      faculty: {
        name: "Prof. Rajesh Kumar",
        role: "Faculty",
        email: credentials.email
      },
      hod: {
        name: "Dr. Meera Nair",
        role: "Head of Department",
        email: credentials.email
      },
      ceo: {
        name: "Dr. Suresh Reddy",
        role: "CEO",
        email: credentials.email
      }
    };

    setUser(mockUsers[selectedRole] || mockUsers.student);
    setAppState("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole("");
    setAppState("role-selection");
  };

  const handleBackToRoles = () => {
    setSelectedRole("");
    setAppState("role-selection");
  };

  if (appState === "role-selection") {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  if (appState === "login") {
    return (
      <LoginForm
        role={selectedRole}
        onBack={handleBackToRoles}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      {selectedRole === "student" && <StudentForm />}
      {selectedRole !== "student" && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-academic-navy mb-4">
              {user?.role} Dashboard
            </h2>
            <p className="text-academic-gray">
              Dashboard functionality coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
