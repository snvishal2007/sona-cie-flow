import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  studentName: string;
  regNumber: string;
  department: string;
  semester: string;
  section: string;
  courses: string[];
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedBy?: string[];
}

interface ApprovalDashboardProps {
  role: string;
}

// Mock data - In real app, this would come from Google Sheets
const mockRequests: Request[] = [
  {
    id: "1",
    studentName: "Arjun Kumar",
    regNumber: "2021IT001",
    department: "Information Technology",
    semester: "4",
    section: "A",
    courses: ["U23IT401 - Operating Systems", "U23IT402 - Design and Analysis of Algorithms"],
    reason: "Medical",
    status: "pending",
    submittedAt: "2024-01-15",
    approvedBy: []
  },
  {
    id: "2",
    studentName: "Priya Sharma",
    regNumber: "2021IT002",
    department: "Information Technology",
    semester: "3",
    section: "B",
    courses: ["U23IT301 - Data Structures"],
    reason: "On-Duty",
    status: "approved",
    submittedAt: "2024-01-14",
    approvedBy: ["Class Teacher", "Faculty"]
  }
];

export const ApprovalDashboard = ({ role }: ApprovalDashboardProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const handleAction = (request: Request, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks("");
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    const updatedRequests = requests.map(req => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: (actionType === "approve" ? "approved" : "rejected") as "approved" | "rejected",
          approvedBy: actionType === "approve" 
            ? [...(req.approvedBy || []), role]
            : req.approvedBy
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setSelectedRequest(null);
    setActionType(null);
    setRemarks("");

    toast({
      title: `Request ${actionType === "approve" ? "Approved" : "Rejected"}`,
      description: `The request has been ${actionType}d successfully.`,
    });
  };

  const downloadCSV = () => {
    const approvedRequests = requests.filter(req => req.status === "approved");
    const csvContent = [
      ["Student Name", "Reg Number", "Department", "Semester", "Section", "Courses", "Reason", "Status", "Submitted Date"],
      ...approvedRequests.map(req => [
        req.studentName,
        req.regNumber,
        req.department,
        req.semester,
        req.section,
        req.courses.join("; "),
        req.reason,
        req.status,
        req.submittedAt
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `approved_requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Approved requests have been exported to CSV.",
    });
  };

  const getFilteredRequests = () => {
    if (role === "CEO") {
      return requests.filter(req => req.status === "approved" && req.approvedBy?.includes("HoD"));
    }
    return requests.filter(req => req.status === "pending" || req.status === "approved");
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case "class-teacher": return "Class Teacher";
      case "faculty": return "Faculty";
      case "hod": return "Head of Department";
      case "ceo": return "CEO";
      default: return role;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-academic-navy">
                {getRoleDisplayName()} Dashboard
              </CardTitle>
              <CardDescription>
                {role === "ceo" 
                  ? "Review all approved requests and download reports"
                  : "Review and approve student re-test applications"
                }
              </CardDescription>
            </div>
            {role === "ceo" && (
              <Button onClick={downloadCSV} variant="academic" className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Reg Number</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredRequests().map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.studentName}</TableCell>
                  <TableCell>{request.regNumber}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.semester}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.courses.join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={request.status === "approved" ? "default" : 
                              request.status === "rejected" ? "destructive" : "secondary"}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.approvedBy?.join(", ") || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>Student:</strong> {request.studentName}
                              </div>
                              <div>
                                <strong>Reg Number:</strong> {request.regNumber}
                              </div>
                              <div>
                                <strong>Department:</strong> {request.department}
                              </div>
                              <div>
                                <strong>Semester:</strong> {request.semester}
                              </div>
                              <div>
                                <strong>Section:</strong> {request.section}
                              </div>
                              <div>
                                <strong>Reason:</strong> {request.reason}
                              </div>
                            </div>
                            <div>
                              <strong>Courses:</strong>
                              <ul className="list-disc list-inside mt-2">
                                {request.courses.map((course, index) => (
                                  <li key={index}>{course}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {role !== "ceo" && request.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(request, "approve")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(request, "reject")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {getFilteredRequests().length === 0 && (
            <div className="text-center py-8">
              <p className="text-academic-gray">No requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
        setRemarks("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this request?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="bg-academic-blue-light p-4 rounded-lg">
                <p><strong>Student:</strong> {selectedRequest.studentName}</p>
                <p><strong>Courses:</strong> {selectedRequest.courses.join(", ")}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks {actionType === "reject" && "*"}</label>
              <Textarea
                placeholder={`Enter your remarks for ${actionType}ing this request...`}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required={actionType === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null);
              setActionType(null);
              setRemarks("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={actionType === "approve" ? "academic" : "destructive"}
              disabled={actionType === "reject" && !remarks.trim()}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};