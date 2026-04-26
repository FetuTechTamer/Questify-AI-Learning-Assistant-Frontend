import { useState, useEffect } from "react";
import {
  User,
  Envelope,
  Calendar,
  Clock,
  Trophy,
  Target,
  Flame,
  BookOpen,
  TrendUp,
  Star,
  Medal,
  ChartBar,
  PencilSimple
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Try getting full profile, fallback to basic profile
        let profileRes;
        try {
            profileRes = await API.getFullProfile();
        } catch (e) {
            profileRes = await API.getUserProfile();
        }

        let materialsRes = { data: [] };
        try {
            materialsRes = await API.getMaterials();
        } catch (e) {
            console.error("Failed to load materials", e);
        }

        let examsRes = { data: [] };
        try {
          examsRes = await API.getExamHistory();
        } catch (e) {
          console.error("Failed to load exam history", e);
        }

        if (profileRes?.data) {
          setProfileData(profileRes.data);
        } else {
            // handle structure where user is direct
            setProfileData({ user: profileRes.user || profileRes.data || profileRes, profile: profileRes.profile || {} });
        }
        
        if (materialsRes?.data) {
          setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
        }
        if (examsRes?.data) {
          setExamHistory(Array.isArray(examsRes.data) ? examsRes.data : []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground font-medium">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profileData?.user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-card border rounded-3xl p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} weight="bold" />
            </div>
            <h2 className="text-2xl font-bold">Oops!</h2>
            <p className="text-muted-foreground">{error || "Failed to load profile"}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { user, profile } = profileData;
  const safeProfile = profile || {};
  
  const userName = user?.full_name || "Student";
  const userEmail = user?.email || "";
  const firstLetter = userName.charAt(0).toUpperCase();

  const streakDays = safeProfile.streak_days || 0;
  const avgScore = safeProfile.average_score || 0;
  const studyHours = safeProfile.total_study_hours || 0;
  
  // Try to calculate rank or fallback
  const rank = safeProfile.rank || (avgScore > 90 ? "Top 5%" : avgScore > 80 ? "Top 20%" : "Rising Star");

  const learningStyle = safeProfile.learning_style || "Not Determined";
  const peakHours = safeProfile.peak_hours || "Not Determined";
  const strongConcepts = safeProfile.strong_concepts || [];

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12 max-w-6xl mx-auto space-y-8">
        {/* Clean Profile Header */}
        <div className="relative mb-12">
          <div className="h-48 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 w-full overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
          </div>

          <div className="px-8 flex flex-col md:flex-row items-end gap-8 -mt-16 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-background border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-4xl font-black text-primary">
                  {firstLetter}
                </div>
              )}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-2">
                {userName}
                {user?.is_verified && <Medal weight="fill" className="text-blue-500" size={24} />}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-2"><Envelope weight="bold" /> {userEmail}</span>
                <span className="text-primary font-bold">Pro Member</span>
              </div>
            </div>

            <Button variant="outline" className="mb-2 rounded-full font-bold">
              <PencilSimple className="mr-2" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Day Streak", val: streakDays.toString(), icon: Flame, color: "text-orange-500 bg-orange-500/10" },
            { label: "Avg Score", val: `${avgScore}%`, icon: Target, color: "text-blue-500 bg-blue-500/10" },
            { label: "Study Hours", val: `${studyHours}h`, icon: Clock, color: "text-purple-500 bg-purple-500/10" },
            { label: "Rank", val: rank, icon: Trophy, color: "text-yellow-500 bg-yellow-500/10" },
          ].map((s, i) => (
            <div key={i} className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.color)}>
                <s.icon weight="fill" size={24} />
              </div>
              <div>
                <div className="text-2xl font-black">{s.val}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Courses & History */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Active Materials</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/materials')}>View All</Button>
              </div>
              {materials.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {materials.slice(0, 4).map((material: any) => (
                    <div key={material.id || material.material_id} className="p-4 rounded-2xl border bg-muted/20 hover:bg-background hover:border-primary/20 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform">📄</span>
                        <Badge variant="secondary" className="font-bold">{material.progress || 0}%</Badge>
                      </div>
                      <h4 className="font-bold mb-1 line-clamp-1">{material.title || material.name || 'Untitled Material'}</h4>
                      <Progress value={material.progress || 0} className="h-1.5 mt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                  <BookOpen size={48} weight="thin" className="mx-auto mb-3 opacity-50" />
                  <p>No materials found. Upload some to get started!</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/materials')}>
                    Upload Material
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-card border rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold">Recent Exam History</h3>
              <div className="space-y-4">
                {examHistory.length > 0 ? (
                  examHistory.slice(0, 5).map((exam: any) => (
                    <div key={exam.id || exam.exam_id} className="flex items-center gap-4 p-4 rounded-2xl border hover:bg-muted/30 transition-colors">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm",
                        (exam.score || 0) >= 90 ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                      )}>
                        {exam.score || 0}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{exam.title || exam.courseName || "General Exam"}</div>
                        <div className="text-xs text-muted-foreground">
                          {exam.date ? new Date(exam.date).toLocaleDateString() : "Recent"} 
                          {exam.timeTaken ? ` • ${exam.timeTaken} mins` : ""}
                        </div>
                      </div>
                      {exam.improvement > 0 && (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">+{exam.improvement}%</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No exam history available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Insights */}
          <div className="space-y-6">
            <div className="bg-card border rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold">Cognitive Profile</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Learning Style</div>
                  <div className="font-black text-lg capitalize">{learningStyle}</div>
                </div>

                <div className="p-4 rounded-2xl bg-muted/50">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Peak Hours</div>
                  <div className="font-bold capitalize">{peakHours}</div>
                </div>
              </div>

              {strongConcepts.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Strong Concepts</div>
                  <div className="flex flex-wrap gap-2">
                    {strongConcepts.map((t: string) => (
                      <Badge key={t} variant="secondary" className="px-3 py-1">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
