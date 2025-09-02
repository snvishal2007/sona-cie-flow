import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  faculty_email: string;
}

interface NewStudentFormProps {
  user: any;
  userProfile: any;
}

export const NewStudentForm = ({ user, userProfile }: NewStudentFormProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<{
    [courseId: string]: { type: 'retest' | 'improvement' | null; reason: string }
  }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, [userProfile]);

  const fetchCourses = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('department', userProfile.department)
        .eq('semester', userProfile.semester)
        .eq('section', userProfile.section);

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching courses",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCourseSelection = (courseId: string, type: 'retest' | 'improvement') => {
    setSelectedCourses(prev => ({
      ...prev,
      [courseId]: {
        type: prev[courseId]?.type === type ? null : type,
        reason: prev[courseId]?.reason || ''
      }
    }));
  };

  const handleReasonChange = (courseId: string, reason: string) => {
    setSelectedCourses(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        reason
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const applications = Object.entries(selectedCourses)
        .filter(([_, selection]) => selection.type && selection.reason.trim())
        .map(([courseId, selection]) => ({
          student_id: user.id,
          course_id: courseId,
          application_type: selection.type,
          reason: selection.reason.trim()
        }));

      if (applications.length === 0) {
        toast({
          title: "No applications to submit",
          description: "Please select at least one course and provide a reason",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('applications')
        .insert(applications);

      if (error) throw error;

      toast({
        title: "Applications Submitted",
        description: `Successfully submitted ${applications.length} application(s)`
      });

      // Reset form
      setSelectedCourses({});
    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-academic-navy">
            CIE Retest/Improvement Application
          </CardTitle>
          <CardDescription>
            Select courses for retest or improvement and provide reasons
          </CardDescription>
          <div className="text-sm text-academic-gray">
            <p><strong>Department:</strong> {userProfile.department}</p>
            <p><strong>Semester:</strong> {userProfile.semester}</p>
            <p><strong>Section:</strong> {userProfile.section}</p>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-academic-gray">
                No courses found for your department/semester/section. 
                Please contact your class teacher.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-academic-navy">
                        {course.course_code} - {course.course_name}
                      </h3>
                      <p className="text-sm text-academic-gray">
                        Faculty: {course.faculty_email}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`retest-${course.id}`}
                          checked={selectedCourses[course.id]?.type === 'retest'}
                          onCheckedChange={() => handleCourseSelection(course.id, 'retest')}
                        />
                        <Label htmlFor={`retest-${course.id}`}>Retest</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`improvement-${course.id}`}
                          checked={selectedCourses[course.id]?.type === 'improvement'}
                          onCheckedChange={() => handleCourseSelection(course.id, 'improvement')}
                        />
                        <Label htmlFor={`improvement-${course.id}`}>Improvement</Label>
                      </div>
                    </div>
                  </div>
                  {selectedCourses[course.id]?.type && (
                    <div className="space-y-2">
                      <Label htmlFor={`reason-${course.id}`}>
                        Reason for {selectedCourses[course.id]?.type}
                      </Label>
                      <Textarea
                        id={`reason-${course.id}`}
                        placeholder="Please provide a detailed reason for your application"
                        value={selectedCourses[course.id]?.reason || ''}
                        onChange={(e) => handleReasonChange(course.id, e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                disabled={loading || Object.values(selectedCourses).every(selection => !selection.type)}
              >
                {loading ? "Submitting..." : "Submit Applications"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};