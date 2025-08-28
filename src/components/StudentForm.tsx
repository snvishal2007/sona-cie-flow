import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileUp, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  User,
  GraduationCap 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const departments = [
  { 
    value: "aids", 
    label: "Artificial Intelligence and Data Science",
    url: "https://www.sonatech.ac.in/departments/aids"
  },
  { 
    value: "csml", 
    label: "Computer Science and Engineering (AI and ML)",
    url: "https://www.sonatech.ac.in/departments/csml"
  },
  { 
    value: "bme", 
    label: "Bio Medical Engineering",
    url: "https://www.sonatech.ac.in/departments/bme"
  },
  { 
    value: "csd", 
    label: "Computer Science and Design",
    url: "https://www.sonatech.ac.in/departments/csd"
  },
  { 
    value: "civil", 
    label: "Civil Engineering",
    url: "https://www.sonatech.ac.in/departments/civil"
  },
  { 
    value: "cse", 
    label: "Computer Science and Engineering",
    url: "https://www.sonatech.ac.in/departments/cse"
  },
  { 
    value: "ece", 
    label: "Electronics and Communication Engineering",
    url: "https://www.sonatech.ac.in/departments/ece"
  },
  { 
    value: "eee", 
    label: "Electrical and Electronics Engineering",
    url: "https://www.sonatech.ac.in/departments/eee"
  },
  { 
    value: "ecr", 
    label: "Electrical and Computer Engineering",
    url: "https://www.sonatech.ac.in/departments/ecr"
  },
  { 
    value: "ecm", 
    label: "Electronics and Computer Engineering",
    url: "https://www.sonatech.ac.in/departments/ecm"
  },
  { 
    value: "ft", 
    label: "Fashion Technology",
    url: "https://www.sonatech.ac.in/departments/ft"
  },
  { 
    value: "it", 
    label: "Information Technology",
    url: "https://www.sonatech.ac.in/departments/it"
  },
  { 
    value: "mech", 
    label: "Mechanical Engineering",
    url: "https://www.sonatech.ac.in/departments/mech"
  },
  { 
    value: "mechatronics", 
    label: "Mechatronics Engineering",
    url: "https://www.sonatech.ac.in/departments/mechatronics"
  }
];

const itFaculty = [
  "Dr. A. Rama Mohan Reddy", "Dr. B. Srinivasan", "Dr. C. Venkatesh",
  "Dr. D. Malathi", "Dr. E. Priya", "Dr. F. Kumar", "Dr. G. Lakshmi",
  "Dr. H. Rajesh", "Dr. I. Meera", "Dr. J. Anand", "Dr. K. Divya",
  "Dr. L. Prasad", "Dr. M. Sangeetha", "Dr. N. Ravi", "Dr. O. Kavitha",
  "Prof. P. Suresh", "Prof. Q. Nandini", "Prof. R. Vijay", "Prof. S. Deepa",
  "Prof. T. Mohan", "Prof. U. Preethi", "Prof. V. Kiran", "Prof. W. Swathi",
  "Prof. X. Naveen", "Prof. Y. Rekha", "Prof. Z. Arun", "Dr. AA. Bhavani",
  "Dr. BB. Srikanth", "Dr. CC. Lavanya", "Dr. DD. Mahesh", "Dr. EE. Sowmya",
  "Prof. FF. Ramesh", "Prof. GG. Padma", "Prof. HH. Gopal", "Prof. II. Shanti",
  "Prof. JJ. Bala", "Prof. KK. Satish", "Prof. LL. Vasanti", "Prof. MM. Hari",
  "Prof. NN. Geetha", "Prof. OO. Sunil", "Prof. PP. Radha", "Prof. QQ. Manoj",
  "Prof. RR. Usha", "Prof. SS. Vinod", "Prof. TT. Latha"
];

const getCoursesBySemester = (dept: string, semester: string) => {
  if (dept === "it") {
    switch (semester) {
      case "1":
        return [
          { code: "U23ENG101A", name: "Communication Skills in English" },
          { code: "U23MAT102A", name: "Linear Algebra and Calculus with MATLAB" },
          { code: "U23PHY103A", name: "Physics for Information Science" },
          { code: "U23PPR105", name: "Problem Solving using Python Programming" },
          { code: "U23BEE106A", name: "Basics of Electrical and Electronics Engineering" }
        ];
      case "2":
        return [
          { code: "U23ENG201A", name: "Technical English" },
          { code: "U23MAT202A", name: "Discrete Mathematical Structures" },
          { code: "U23CHE204A", name: "Chemistry for Information Science" },
          { code: "U23CPR205", name: "Programming in C" },
          { code: "U23IT201", name: "Microprocessor and Microcontroller" },
          { code: "U23ENGR207", name: "Engineering Graphics" }
        ];
      case "3":
        return [
          { code: "U23MAT301E", name: "Applied Probability and Statistics – I" },
          { code: "U23IT301", name: "Data Structures" },
          { code: "U23IT302", name: "Computer Architecture" },
          { code: "U23IT303", name: "Object Oriented Programming in C++" },
          { code: "U23IT304", name: "Digital Logic Design" }
        ];
      case "4":
        return [
          { code: "U23MAT401A", name: "Applied Probability and Statistics – II" },
          { code: "U23IT401", name: "Operating Systems" },
          { code: "U23IT402", name: "Design and Analysis of Algorithms" },
          { code: "U23IT403", name: "Java Programming" },
          { code: "U23ADS401", name: "Software Production Engineering – Agile and DevOps" }
        ];
      default:
        return [];
    }
  }
  return [];
};

interface Course {
  code: string;
  name: string;
  retest: boolean;
  improvement: boolean;
}

export const StudentForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<"basic" | "form">("basic");
  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    department: "",
    semester: "",
    section: "",
    reason: "",
    otherReason: "",
    faculty: "",
    supportingDocs: null as File | null
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.department && formData.semester) {
      const availableCourses = getCoursesBySemester(formData.department, formData.semester);
      setCourses(availableCourses.map(course => ({
        ...course,
        retest: false,
        improvement: false
      })));
    }
  }, [formData.department, formData.semester]);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.regNumber) {
      setStep("form");
    }
  };

  const handleCourseChange = (index: number, field: "retest" | "improvement", value: boolean) => {
    const newCourses = [...courses];
    newCourses[index][field] = value;
    setCourses(newCourses);

    const selectedCount = newCourses.filter(c => c.retest || c.improvement).length;
    if (selectedCount > 7) {
      toast({
        title: "Maximum Limit Reached",
        description: "You can select maximum 7 courses for re-test/improvement.",
        variant: "destructive"
      });
      newCourses[index][field] = false;
      setCourses(newCourses);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      setFormData({ ...formData, supportingDocs: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedCourses = courses.filter(c => c.retest || c.improvement);
    if (selectedCourses.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course for re-test or improvement.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Application Submitted Successfully!",
        description: "Your re-test application has been submitted for approval.",
      });
    }, 2000);
  };

  const openDepartmentPage = (dept: string) => {
    const department = departments.find(d => d.value === dept);
    if (department) {
      window.open(department.url, "_blank");
    }
  };

  if (step === "basic") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-md pt-8">
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-academic-navy">Student Information</CardTitle>
              <CardDescription>Enter your basic details to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name of the Student</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number</Label>
                  <Input
                    id="regNumber"
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    placeholder="Enter your registration number"
                    required
                  />
                </div>
                <Button type="submit" variant="academic" className="w-full">
                  Continue to Application Form
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="text-2xl text-academic-navy flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              CIE Re-Test Application Form
            </CardTitle>
            <CardDescription>
              Complete the form below to submit your re-test/improvement application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Info Display */}
              <div className="bg-academic-blue-light p-4 rounded-lg">
                <h3 className="font-semibold text-academic-navy mb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-academic-gray">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-academic-gray">Registration Number:</span>
                    <span className="ml-2 font-medium">{formData.regNumber}</span>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                     <SelectContent>
                       {departments.map((dept) => (
                         <SelectItem key={dept.value} value={dept.value}>
                           {dept.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}{i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} Semester
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D", "E", "F"].map((section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reason for Absence */}
              <div className="space-y-4">
                <Label>Reason for Absence</Label>
                <RadioGroup
                  value={formData.reason}
                  onValueChange={(value) => setFormData({ ...formData, reason: value, otherReason: "" })}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medical" id="medical" />
                    <Label htmlFor="medical">Medical</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on-duty" id="on-duty" />
                    <Label htmlFor="on-duty">On-Duty</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="others" id="others" />
                    <Label htmlFor="others">Others</Label>
                  </div>
                </RadioGroup>
                {formData.reason === "others" && (
                  <Textarea
                    placeholder="Please specify the reason..."
                    value={formData.otherReason}
                    onChange={(e) => setFormData({ ...formData, otherReason: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Faculty Selection */}
              {formData.department && formData.section && (
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Select
                    value={formData.faculty}
                    onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.department === "it" ? itFaculty : []).map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Course Selection */}
              {courses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Course Selection (Maximum 7)</Label>
                    <span className="text-sm text-academic-gray">
                      {courses.filter(c => c.retest || c.improvement).length}/7 selected
                    </span>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-academic-blue-light font-medium text-sm">
                      <div>Course Code</div>
                      <div>Course Name</div>
                      <div className="text-center">Re-test</div>
                      <div className="text-center">Improvement</div>
                    </div>
                    {courses.map((course, index) => (
                      <div key={course.code} className="grid grid-cols-4 gap-4 p-4 border-t">
                        <div className="font-mono text-sm">{course.code}</div>
                        <div className="text-sm">{course.name}</div>
                        <div className="text-center">
                          <Checkbox
                            checked={course.retest}
                            onCheckedChange={(checked) => 
                              handleCourseChange(index, "retest", checked as boolean)
                            }
                          />
                        </div>
                        <div className="text-center">
                          <Checkbox
                            checked={course.improvement}
                            onCheckedChange={(checked) => 
                              handleCourseChange(index, "improvement", checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">Supporting Documents</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-academic-gray mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-academic-gray">
                      Upload medical certificate, on-duty letter, or other supporting documents
                    </p>
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file")?.click()}
                    >
                      Choose File
                    </Button>
                    {formData.supportingDocs && (
                      <p className="text-sm text-academic-success">
                        {formData.supportingDocs.name} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: "",
                      regNumber: "",
                      department: "",
                      semester: "",
                      section: "",
                      reason: "",
                      otherReason: "",
                      faculty: "",
                      supportingDocs: null
                    });
                    setCourses([]);
                    setStep("basic");
                  }}
                  className="flex-1"
                >
                  Clear Form
                </Button>
                <Button 
                  type="submit" 
                  variant="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};