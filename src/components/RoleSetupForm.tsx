import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoleSetupFormProps {
  user: any;
  onSetupComplete: () => void;
}

interface Course {
  courseCode: string;
  courseName: string;
  facultyEmail: string;
}

const departments = ["IT", "CSE", "ECE", "EEE", "MECH", "CIVIL"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const sections = ["A", "B", "C"];

export const RoleSetupForm = ({ user, onSetupComplete }: RoleSetupFormProps) => {
  const [profile, setProfile] = useState({
    fullName: "",
    role: "",
    department: "",
    semester: "",
    section: "",
    rollNumber: ""
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddCourse = () => {
    if (courses.length < 10) {
      setCourses([...courses, { courseCode: "", courseName: "", facultyEmail: "" }]);
    }
  };

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          role: profile.role as 'student' | 'class_teacher' | 'faculty' | 'hod' | 'coe',
          department: profile.department,
          semester: profile.role === 'student' ? parseInt(profile.semester) : null,
          section: profile.role === 'student' ? profile.section : null,
          roll_number: profile.role === 'student' ? profile.rollNumber : null,
          is_first_login: false
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // If class teacher, save courses
      if (profile.role === 'class_teacher' && courses.length > 0) {
        const validCourses = courses.filter(course => 
          course.courseCode && course.courseName && course.facultyEmail
        );

        if (validCourses.length > 0) {
          const coursesToInsert = validCourses.map(course => ({
            course_code: course.courseCode,
            course_name: course.courseName,
            faculty_email: course.facultyEmail,
            department: profile.department,
            semester: parseInt(profile.semester),
            section: profile.section,
            class_teacher_id: user.id
          }));

          const { error: coursesError } = await supabase
            .from('courses')
            .insert(coursesToInsert);

          if (coursesError) throw coursesError;
        }
      }

      toast({
        title: "Setup Complete",
        description: "Your profile has been updated successfully"
      });

      onSetupComplete();
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-large">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-academic-navy">
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Please provide your details to complete the setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(value) => setProfile({...profile, role: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="class_teacher">Class Teacher</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="hod">Head of Department</SelectItem>
                      <SelectItem value="coe">COE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => setProfile({...profile, department: value})} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {profile.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select onValueChange={(value) => setProfile({...profile, semester: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>{sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Select onValueChange={(value) => setProfile({...profile, section: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((sec) => (
                            <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {profile.role === 'class_teacher' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select onValueChange={(value) => setProfile({...profile, semester: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>{sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Select onValueChange={(value) => setProfile({...profile, section: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((sec) => (
                            <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {profile.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    value={profile.rollNumber}
                    onChange={(e) => setProfile({...profile, rollNumber: e.target.value})}
                    required
                  />
                </div>
              )}

              {profile.role === 'class_teacher' && (
                <>
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-academic-navy">
                      Course Information
                    </Label>
                    <div className="flex justify-between items-center">
                      <Label className="text-md font-semibold">Courses (Max 10)</Label>
                      <Button
                        type="button"
                        onClick={handleAddCourse}
                        disabled={courses.length >= 10}
                        className="bg-academic-blue hover:bg-academic-blue-dark text-white"
                      >
                        Add Course
                      </Button>
                    </div>
                    {courses.map((course, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={`course-code-${index}`}>Course Code</Label>
                          <Input
                            id={`course-code-${index}`}
                            placeholder="e.g., CS101"
                            value={course.courseCode}
                            onChange={(e) => handleCourseChange(index, 'courseCode', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`course-name-${index}`}>Course Name</Label>
                          <Input
                            id={`course-name-${index}`}
                            placeholder="e.g., Programming Fundamentals"
                            value={course.courseName}
                            onChange={(e) => handleCourseChange(index, 'courseName', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`faculty-email-${index}`}>Faculty Outlook Email</Label>
                          <Input
                            id={`faculty-email-${index}`}
                            type="email"
                            placeholder="faculty@sonatech.ac.in"
                            value={course.facultyEmail}
                            onChange={(e) => handleCourseChange(index, 'facultyEmail', e.target.value)}
                            required
                          />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCourse(index)}
                          >
                            Remove Course
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary-hover text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};