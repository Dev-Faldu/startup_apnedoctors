import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users,
  ArrowLeft,
  RefreshCw,
  Eye,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

interface TriageReport {
  id: string;
  assessment_id: string;
  risk_level: "GREEN" | "AMBER" | "RED";
  triage_level: number;
  medical_summary: string;
  chief_complaint: string;
  possible_conditions: string[];
  recommendations: string[];
  red_flags: string[];
  confidence_score: number;
  doctor_reviewed: boolean;
  doctor_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  assessments: {
    id: string;
    body_part: string;
    symptoms: string;
    pain_level: number;
    duration: string;
    patients: {
      name: string;
      email: string;
    } | null;
  };
}

const Doctor = () => {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<TriageReport | null>(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ["triage-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("triage_reports")
        .select(`
          *,
          assessments (
            id,
            body_part,
            symptoms,
            pain_level,
            duration,
            patients (
              name,
              email
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as TriageReport[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ reportId, notes }: { reportId: string; notes: string }) => {
      const { error } = await supabase
        .from("triage_reports")
        .update({
          doctor_reviewed: true,
          doctor_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-reports"] });
      toast.success("Report marked as reviewed");
      setSelectedReport(null);
      setDoctorNotes("");
    },
    onError: () => {
      toast.error("Failed to update report");
    },
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "RED":
        return <Badge className="bg-destructive text-destructive-foreground animate-pulse">URGENT</Badge>;
      case "AMBER":
        return <Badge className="bg-amber-500 text-primary-foreground">MODERATE</Badge>;
      case "GREEN":
        return <Badge className="bg-emerald-500 text-primary-foreground">LOW RISK</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const stats = {
    total: reports?.length || 0,
    urgent: reports?.filter((r) => r.risk_level === "RED").length || 0,
    pending: reports?.filter((r) => !r.doctor_reviewed).length || 0,
    reviewed: reports?.filter((r) => r.doctor_reviewed).length || 0,
  };

  // Sort reports with RED first, then by date
  const sortedReports = reports?.sort((a, b) => {
    const riskOrder = { RED: 0, AMBER: 1, GREEN: 2 };
    const riskDiff = riskOrder[a.risk_level] - riskOrder[b.risk_level];
    if (riskDiff !== 0) return riskDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
                <p className="text-sm text-muted-foreground">AI Triage Review Console</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 neon-border"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Cases</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.urgent}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{stats.reviewed}</p>
                <p className="text-xs text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Triage Cases
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : sortedReports?.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No triage reports yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {sortedReports?.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 hover:bg-muted/20 transition-colors cursor-pointer ${
                    report.risk_level === "RED" && !report.doctor_reviewed
                      ? "bg-destructive/5 border-l-4 border-l-destructive"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedReport(report);
                    setDoctorNotes(report.doctor_notes || "");
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getRiskBadge(report.risk_level)}
                        <span className="text-xs text-muted-foreground">
                          Level {report.triage_level}
                        </span>
                        {report.doctor_reviewed && (
                          <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-foreground truncate">
                        {report.chief_complaint || report.assessments?.symptoms?.slice(0, 50)}...
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{report.assessments?.body_part}</span>
                        <span>Pain: {report.assessments?.pain_level}/10</span>
                        <span>{format(new Date(report.created_at), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border/30 flex items-center justify-between sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                {getRiskBadge(selectedReport.risk_level)}
                <span className="font-semibold">Case Details</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedReport(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Chief Complaint */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Chief Complaint</h3>
                <p className="text-foreground">{selectedReport.chief_complaint}</p>
              </div>

              {/* Assessment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Body Part</h3>
                  <p className="text-foreground capitalize">{selectedReport.assessments?.body_part}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Pain Level</h3>
                  <p className="text-foreground">{selectedReport.assessments?.pain_level}/10</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                  <p className="text-foreground">{selectedReport.assessments?.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Confidence</h3>
                  <p className="text-foreground">{selectedReport.confidence_score}%</p>
                </div>
              </div>

              {/* Medical Summary */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Medical Summary</h3>
                <p className="text-foreground text-sm leading-relaxed">{selectedReport.medical_summary}</p>
              </div>

              {/* Possible Conditions */}
              {selectedReport.possible_conditions && (selectedReport.possible_conditions as string[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Possible Conditions</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedReport.possible_conditions as string[]).map((condition, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {selectedReport.red_flags && (selectedReport.red_flags as string[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Red Flags
                  </h3>
                  <ul className="space-y-1">
                    {(selectedReport.red_flags as string[]).map((flag, i) => (
                      <li key={i} className="text-sm text-destructive/90 flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedReport.recommendations && (selectedReport.recommendations as string[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {(selectedReport.recommendations as string[]).map((rec, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doctor Notes */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Doctor Notes</h3>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add your clinical notes..."
                  className="min-h-[100px] bg-muted/30"
                  disabled={selectedReport.doctor_reviewed}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
                {!selectedReport.doctor_reviewed && (
                  <Button
                    onClick={() =>
                      reviewMutation.mutate({
                        reportId: selectedReport.id,
                        notes: doctorNotes,
                      })
                    }
                    disabled={reviewMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as Reviewed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctor;