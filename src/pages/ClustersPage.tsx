import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Cluster, DEFAULT_TIME_WINDOWS } from '../types/index';
import { Info, AlertCircle, ArrowLeft, Calendar, Clock, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';

const ClustersPage: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState(300000); // Default to 5 minutes
  const navigate = useNavigate();
  const location = useLocation();

  // Extract search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const accountId = searchParams.get('accountId') || '';
  const traceId = searchParams.get('traceId') || '';
  const correlationId = searchParams.get('correlationId') || '';
  const timeRange = searchParams.get('timeRange') || '24hr';
  
  // Determine search type and value
  const searchType = accountId ? 'accountId' : traceId ? 'traceId' : 'correlationId';
  const searchValue = accountId || traceId || correlationId;

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  // Format duration for display
  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      return `${(ms / 60000).toFixed(2)}min`;
    }
  };

  // Navigate to graph page when a cluster is clicked
  const handleClusterClick = (startTime: string) => {
    navigate(`/graph?startTime=${encodeURIComponent(startTime)}&isCluster=true`);
  };

  // Fetch clusters when parameters change
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const data = await api.getClusters(searchValue, searchType, timeRange, timeWindow);
        setClusters(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching clusters:', err);
        setError('Failed to fetch clusters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [searchValue, searchType, timeRange, timeWindow]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="text-primary">Clustering events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4">
        <Card className="max-w-6xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-destructive p-4">
              <p className="text-lg flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </p>
              <Button onClick={() => navigate('/')} className="mt-4 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <Card className="max-w-6xl mx-auto border-none shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Time-Based Clusters</CardTitle>
              <CardDescription>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    {searchType === 'accountId' ? 'Account ID' : searchType === 'traceId' ? 'Trace ID' : 'X-Correlation-ID'}: 
                    <span className="font-medium">{searchValue}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Time Range: <span className="font-medium">{timeRange}</span>
                  </div>
                </div>
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Window:</span>
                <Select 
                  value={timeWindow.toString()} 
                  onValueChange={(value) => setTimeWindow(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_WINDOWS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{clusters.length} clusters found</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clusters.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                <Info className="h-5 w-5" /> No clusters found for the given criteria.
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Start Time</TableHead>
                    <TableHead className="font-medium">Duration</TableHead>
                    <TableHead className="font-medium">Events</TableHead>
                    <TableHead className="font-medium">Services</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clusters.map((cluster) => (
                    <TableRow key={cluster.id} onClick={() => handleClusterClick(cluster.startTime.toISOString())} className="cursor-pointer">
                      <TableCell>{formatDate(cluster.startTime)}</TableCell>
                      <TableCell>{formatDuration(cluster.duration)}</TableCell>
                      <TableCell>{cluster.events.length}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cluster.services.map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            cluster.status === 'success' ? 'success' : 
                            cluster.status === 'error' ? 'destructive' : 
                            'outline'
                          }
                        >
                          {cluster.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClustersPage;
