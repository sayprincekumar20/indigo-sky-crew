import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Award, 
  Plane, 
  Calendar,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface CrewMember {
  Crew_ID: string;
  Name: string;
  Base: string;
  Rank: string;
  Qualification: string;
  Aircraft_Type_License: string;
  Leave_Start: string | null;
  Leave_End: string | null;
}

interface CrewSchedule {
  roster_id: number;
  start_date: string;
  end_date: string;
  violation_count: number;
}

interface CrewPreference {
  type: string;
  detail: string;
  priority: string;
}

interface CrewDetailsModalProps {
  crewId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CrewDetailsModal: React.FC<CrewDetailsModalProps> = ({ crewId, isOpen, onClose }) => {
  const [crewDetails, setCrewDetails] = useState<CrewMember | null>(null);
  const [schedule, setSchedule] = useState<CrewSchedule[]>([]);
  const [preferences, setPreferences] = useState<CrewPreference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crewId && isOpen) {
      fetchCrewDetails();
    }
  }, [crewId, isOpen]);

  const fetchCrewDetails = async () => {
    if (!crewId) return;
    
    try {
      setLoading(true);
      
      // Fetch crew member details
      const crewResponse = await fetch(`http://127.0.0.1:8000/api/v1/crew?limit=100&offset=0`);
      const crewData = await crewResponse.json();
      const crew = crewData.crew_members.find((c: CrewMember) => c.Crew_ID === crewId);
      
      if (crew) {
        setCrewDetails(crew);
      }

      // Fetch schedule
      try {
        const scheduleResponse = await fetch(`http://127.0.0.1:8000/api/v1/crew/${crewId}/schedule`);
        const scheduleData = await scheduleResponse.json();
        setSchedule(scheduleData.schedules || []);
      } catch (error) {
        console.log('Schedule not available for this crew member');
        setSchedule([]);
      }

      // Fetch preferences
      try {
        const preferencesResponse = await fetch(`http://127.0.0.1:8000/api/v1/preferences/${crewId}`);
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData.preferences || []);
      } catch (error) {
        console.log('Preferences not available for this crew member');
        setPreferences([]);
      }
    } catch (error) {
      console.error('Error fetching crew details:', error);
      toast.error('Failed to fetch crew details');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'captain': return 'bg-primary text-primary-foreground';
      case 'first officer': return 'bg-emerald-500 text-white';
      case 'senior first officer': return 'bg-emerald-600 text-white';
      case 'instructor/check pilot': return 'bg-purple-600 text-white';
      case 'purser': return 'bg-amber-500 text-white';
      case 'senior cabin crew': return 'bg-blue-500 text-white';
      case 'junior cabin crew': return 'bg-gray-500 text-white';
      case 'sccm (lead cabin crew)': return 'bg-indigo-600 text-white';
      case 'trainee cabin crew': return 'bg-orange-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getQualificationColor = (qualification: string) => {
    switch (qualification?.toLowerCase()) {
      case 'line checked': return 'text-green-600';
      case 'base check': return 'text-blue-600';
      case 'senior': return 'text-purple-600';
      case 'junior': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  if (!crewDetails && !loading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            {loading ? 'Loading...' : `${crewDetails?.Name} (${crewDetails?.Crew_ID})`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : crewDetails ? (
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold">{crewDetails.Name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Crew ID</p>
                      <p className="text-lg font-semibold">{crewDetails.Crew_ID}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Base</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <p className="text-lg font-semibold">{crewDetails.Base}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rank</p>
                      <Badge className={getRankColor(crewDetails.Rank)}>
                        {crewDetails.Rank}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                      <p className={`text-lg font-semibold ${getQualificationColor(crewDetails.Qualification)}`}>
                        <Award className="h-4 w-4 inline mr-1" />
                        {crewDetails.Qualification}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Aircraft License</p>
                      <div className="flex flex-wrap gap-1">
                        {crewDetails.Aircraft_Type_License.split(', ').map((aircraft, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Plane className="h-3 w-3 mr-1" />
                            {aircraft}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(crewDetails.Leave_Start || crewDetails.Leave_End) && (
                    <div className="mt-4 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <p className="font-medium text-amber-800 dark:text-amber-200">Leave Period</p>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {crewDetails.Leave_Start} to {crewDetails.Leave_End}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Schedule History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schedule.length > 0 ? (
                    <div className="space-y-3">
                      {schedule.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Roster #{item.roster_id}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.start_date} to {item.end_date}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={item.violation_count === 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {item.violation_count} violations
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No schedule history available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Crew Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {preferences.length > 0 ? (
                    <div className="space-y-3">
                      {preferences.map((pref, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{pref.type.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">{pref.detail}</p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={getPriorityColor(pref.priority)}
                          >
                            {pref.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No preferences configured
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Crew member not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CrewDetailsModal;