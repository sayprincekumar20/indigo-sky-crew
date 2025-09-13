import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plane,
  AlertTriangle,
  Trophy,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface CrewMember {
  Crew_ID: string;
  Crew_Rank: string;
}

interface RosterFlight {
  Date: string;
  Flight_Number: string;
  Duty_Start: string;
  Duty_End: string;
  Aircraft_Type: string;
  Origin: string;
  Destination: string;
  Duration: string;
  Crew_Members: CrewMember[];
}

interface RosterHistory {
  id: number;
  created_at: string;
  start_date: string;
  end_date: string;
  fitness_score: number;
  violation_count: number;
}

interface RosterDetails {
  roster_id: number;
  roster_data: RosterFlight[];
}

const RosterView = () => {
  const [rosterHistory, setRosterHistory] = useState<RosterHistory[]>([]);
  const [selectedRoster, setSelectedRoster] = useState<RosterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchRosterHistory();
  }, []);

  const fetchRosterHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/v1/rosters/history?limit=20&offset=0');
      const data = await response.json();
      
      if (data.rosters && data.rosters.length > 0) {
        setRosterHistory(data.rosters);
        // Fetch details of the latest roster by default
        fetchRosterDetails(data.rosters[0].id);
      }
    } catch (error) {
      console.error('Error fetching roster history:', error);
      toast.error('Failed to fetch roster history');
    } finally {
      setLoading(false);
    }
  };

  const fetchRosterDetails = async (rosterId: number) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/rosters/${rosterId}`);
      const data = await response.json();
      setSelectedRoster(data);
    } catch (error) {
      console.error('Error fetching roster details:', error);
      toast.error('Failed to fetch roster details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'captain': return 'bg-primary text-primary-foreground';
      case 'first officer': return 'bg-emerald-500 text-white';
      case 'purser': return 'bg-amber-500 text-white';
      case 'fa': return 'bg-purple-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentRosterInfo = rosterHistory.find(r => r.id === selectedRoster?.roster_id);

  return (
    <div className="space-y-6">
      {/* Roster Selection Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generated Rosters</h2>
          <p className="text-muted-foreground">View and manage crew roster assignments</p>
        </div>
        <Button onClick={fetchRosterHistory} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roster History Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Roster History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {rosterHistory.map((roster) => (
              <div
                key={roster.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoster?.roster_id === roster.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                }`}
                onClick={() => fetchRosterDetails(roster.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">#{roster.id}</Badge>
                  <Badge 
                    variant={roster.violation_count === 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {roster.violation_count} violations
                  </Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{formatDate(roster.created_at)}</p>
                  <p className="text-muted-foreground">
                    {roster.start_date} to {roster.end_date}
                  </p>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-primary" />
                    <span className="text-xs">{roster.fitness_score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Roster Details */}
        <div className="lg:col-span-3 space-y-4">
          {currentRosterInfo && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Roster #{currentRosterInfo.id}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={currentRosterInfo.violation_count === 0 ? "default" : "destructive"}
                    >
                      {currentRosterInfo.violation_count} violations
                    </Badge>
                    <Badge variant="outline">
                      Score: {currentRosterInfo.fitness_score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Created on {formatDate(currentRosterInfo.created_at)} • 
                  Period: {currentRosterInfo.start_date} to {currentRosterInfo.end_date}
                </p>
              </CardHeader>
            </Card>
          )}

          {detailsLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedRoster ? (
            <div className="space-y-4">
              {selectedRoster.roster_data.map((flight, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{flight.Flight_Number}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {flight.Origin} → {flight.Destination}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(flight.Duty_Start)} - {formatTime(flight.Duty_End)}
                            </div>
                            <Badge variant="outline">{flight.Aircraft_Type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(flight.Date)}</p>
                        <p className="text-sm text-muted-foreground">Duration: {flight.Duration}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Crew Assignment ({flight.Crew_Members.length} members)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {flight.Crew_Members.map((crew, crewIndex) => (
                          <Badge
                            key={crewIndex}
                            className={getRankColor(crew.Crew_Rank)}
                          >
                            {crew.Crew_ID} ({crew.Crew_Rank})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Roster Selected</h3>
                  <p className="text-muted-foreground">Select a roster from the history to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterView;