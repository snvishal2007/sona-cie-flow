import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RoleSelector } from "@/components/RoleSelector";
import { OTPLoginForm } from "@/components/OTPLoginForm";
import { RoleSetupForm } from "@/components/RoleSetupForm";
import { NewStudentForm } from "@/components/NewStudentForm";
import { NewApprovalDashboard } from "@/components/NewApprovalDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppState = "role-selection" | "login" | "setup" | "dashboard";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("role-selection");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setUserProfile(null);
          setAppState("role-selection");
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile(data);
        if (data.is_first_login) {
          setAppState("setup");
        } else {
          setAppState("dashboard");
        }
      } else {
        // Create profile if doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            role: 'student'
          })
          .select()
          .single();

        if (createError) throw createError;
        
        setUserProfile(newProfile);
        setAppState("setup");
      }
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setAppState("login");
  };

  const handleLogin = async (user: any) => {
    setUser(user);
    await fetchUserProfile(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setSelectedRole("");
    setAppState("role-selection");
  };

  const handleBackToRoles = () => {
    setSelectedRole("");
    setAppState("role-selection");
  };

  const handleSetupComplete = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (appState === "role-selection") {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  if (appState === "login") {
    return (
      <OTPLoginForm
        role={selectedRole}
        onBack={handleBackToRoles}
        onLogin={handleLogin}
      />
    );
  }

  if (appState === "setup") {
    return (
      <RoleSetupForm
        user={user}
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={userProfile} 
        onLogout={handleLogout} 
        userName={userProfile?.full_name} 
      />
      {userProfile?.role === "student" && (
        <NewStudentForm user={user} userProfile={userProfile} />
      )}
      {userProfile?.role !== "student" && (
        <NewApprovalDashboard user={user} userProfile={userProfile} />
      )}
    </div>
  );
};

export default Index;
