import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  application_type: string;
  reason: string;
  status: string;
  created_at: string;
  courses: {
    course_code: string;
    course_name: string;
    faculty_email: string;
  };
  profiles: {
    full_name: string;
    roll_number: string;
    department: string;
    semester: number;
    section: string;
  };
}

interface NewApprovalDashboardProps {
  user: any;
  userProfile: any;
}

export const NewApprovalDashboard = ({ user, userProfile }: NewApprovalDashboardProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [userProfile]);

  const fetchApplications = async () => {
    if (!userProfile) return;

    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          courses!inner(course_code, course_name, faculty_email, department, semester, section),
          profiles!applications_student_id_fkey(full_name, roll_number, department, semester, section)
        `);

      // Apply role-based filtering
      switch (userProfile.role) {
        case 'class_teacher':
          query = query.eq('courses.class_teacher_id', user.id);
          break;
        case 'faculty':
          query = query.eq('courses.faculty_email', userProfile.email);
          break;
        case 'hod':
          query = query.eq('courses.department', userProfile.department);
          break;
        case 'coe':
          // COE can see all applications
          break;
        default:
          return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAction = (application: Application, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setActionType(action);
    setRemarks("");
  };

  const confirmAction = async () => {
    if (!selectedApplication || !actionType) return;

    setLoading(true);
    try {
      const updates: any = {};
      
      if (actionType === 'approve') {
        switch (userProfile.role) {
          case 'class_teacher':
            updates.status = 'approved_by_class_teacher';
            updates.class_teacher_approved_at = new Date().toISOString();
            break;
          case 'faculty':
            updates.status = 'approved_by_faculty';
            updates.faculty_approved_at = new Date().toISOString();
            break;
          case 'hod':
            updates.status = 'approved_by_hod';
            updates.hod_approved_at = new Date().toISOString();
            break;
          case 'coe':
            updates.status = 'approved_by_coe';
            updates.coe_approved_at = new Date().toISOString();
            break;
        }
      } else {
        updates.status = 'rejected';
      }

      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast({
        title: `Application ${actionType}d`,
        description: `Successfully ${actionType}d the application`
      });

      setSelectedApplication(null);
      setActionType(null);
      setRemarks("");
      fetchApplications();
    } catch (error: any) {
      toast({
        title: "Action Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      approved_by_class_teacher: { label: "Approved by Class Teacher", variant: "default" as const },
      approved_by_faculty: { label: "Approved by Faculty", variant: "default" as const },
      approved_by_hod: { label: "Approved by HOD", variant: "default" as const },
      approved_by_coe: { label: "Approved by COE", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canTakeAction = (application: Application) => {
    if (application.status === 'rejected') return false;
    
    switch (userProfile.role) {
      case 'class_teacher':
        return application.status === 'pending';
      case 'faculty':
        return application.status === 'approved_by_class_teacher';
      case 'hod':
        return application.status === 'approved_by_faculty';
      case 'coe':
        return application.status === 'approved_by_hod';
      default:
        return false;
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      class_teacher: "Class Teacher",
      faculty: "Faculty",
      hod: "Head of Department",
      coe: "Chief Operating Executive"
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-academic-navy">
            {getRoleDisplayName(userProfile.role)} Dashboard
          </CardTitle>
          <CardDescription>
            Review and approve retest/improvement applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-academic-gray">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.profiles.full_name}</p>
                          <p className="text-sm text-academic-gray">
                            {application.profiles.roll_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {application.courses.course_code}
                          </p>
                          <p className="text-sm text-academic-gray">
                            {application.courses.course_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {application.application_type.charAt(0).toUpperCase() + 
                           application.application_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            View
                          </Button>
                          {canTakeAction(application) && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAction(application, 'approve')}
                                className="bg-academic-success hover:bg-academic-success/90"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleAction(application, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog 
        open={selectedApplication !== null && actionType === null} 
        onOpenChange={() => setSelectedApplication(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Student Name</Label>
                  <p>{selectedApplication.profiles.full_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Roll Number</Label>
                  <p>{selectedApplication.profiles.roll_number}</p>
                </div>
                <div>
                  <Label className="font-semibold">Department</Label>
                  <p>{selectedApplication.profiles.department}</p>
                </div>
                <div>
                  <Label className="font-semibold">Semester/Section</Label>
                  <p>{selectedApplication.profiles.semester}/{selectedApplication.profiles.section}</p>
                </div>
                <div>
                  <Label className="font-semibold">Course</Label>
                  <p>{selectedApplication.courses.course_code} - {selectedApplication.courses.course_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Application Type</Label>
                  <p className="capitalize">{selectedApplication.application_type}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Reason</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded">{selectedApplication.reason}</p>
              </div>
              <div>
                <Label className="font-semibold">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog 
        open={actionType !== null} 
        onOpenChange={() => {
          setActionType(null);
          setSelectedApplication(null);
          setRemarks("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this application?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional comments..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActionType(null);
                  setSelectedApplication(null);
                  setRemarks("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={loading}
                className={actionType === 'approve' 
                  ? "bg-academic-success hover:bg-academic-success/90" 
                  : ""
                }
                variant={actionType === 'reject' ? "destructive" : "default"}
              >
                {loading ? "Processing..." : `${actionType === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};