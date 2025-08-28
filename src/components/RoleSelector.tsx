import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  UserCheck, 
  GraduationCap, 
  Building, 
  Crown,
  ArrowRight 
} from "lucide-react";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Submit re-test/improvement applications",
    icon: User,
    color: "text-academic-blue"
  },
  {
    id: "class-teacher",
    title: "Class Teacher",
    description: "Review and approve student applications",
    icon: UserCheck,
    color: "text-academic-success"
  },
  {
    id: "faculty",
    title: "Faculty",
    description: "Evaluate course-specific requests",
    icon: GraduationCap,
    color: "text-academic-warning"
  },
  {
    id: "hod",
    title: "Head of Department",
    description: "Department-level approvals",
    icon: Building,
    color: "text-destructive"
  },
  {
    id: "ceo",
    title: "CEO",
    description: "Final authority and oversight",
    icon: Crown,
    color: "text-academic-navy"
  }
];

interface RoleSelectorProps {
  onRoleSelect: (role: string) => void;
}

export const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            CIE Re-Test Application Portal
          </h1>
          <p className="text-xl text-white/90">
            Sona College of Technology - Salem
          </p>
          <p className="text-white/80 mt-2">
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id} 
                className="bg-white/95 backdrop-blur-sm border-0 shadow-large hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => onRoleSelect(role.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-academic-blue-light flex items-center justify-center ${role.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-academic-navy">{role.title}</CardTitle>
                  <CardDescription className="text-academic-gray">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="role" 
                    className="w-full group-hover:bg-academic-blue group-hover:text-white"
                  >
                    Continue as {role.title}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            Need help? Contact IT Support at it.support@sonatech.ac.in
          </p>
        </div>
      </div>
    </div>
  );
};