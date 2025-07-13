import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Info, AlertCircle, ArrowLeft, Calendar, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

interface TraceId {
  id: string;
  timestamp: string;
  clientAppName: string;
  status: string;
  event?: string;
}

const TraceIdsPage: React.FC = () => {
  const [traceIds, setTraceIds] = useState<TraceId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Truncate trace ID for display
  const truncateTraceId = (id: string) => {
    if (id.length > 20) {
      return `${id.substring(0, 10)}...${id.substring(id.length - 10)}`;
    }
    return id;
  };

  // Navigate to graph page when a trace ID is clicked
  const handleTraceClick = (traceId: string) => {
    navigate(`/graph?traceId=${traceId}`);
  };

  useEffect(() => {
    const fetchTraceIds = async () => {
      try {
        setLoading(true);
        // @ts-ignore - We'll assume the API service has this method
        const data = await api.getTraceIds(searchValue, searchType, timeRange);
        setTraceIds(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trace IDs:', err);
        setError('Failed to fetch trace IDs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTraceIds();
  }, [searchValue, searchType, timeRange]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="text-primary">Loading trace IDs...</span>
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
          <CardTitle className="text-2xl font-bold">Trace IDs</CardTitle>
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
        </CardHeader>
        <CardContent>
          {traceIds.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
                <Info className="h-5 w-5" /> No trace IDs found for the given criteria.
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
                    <TableHead className="font-medium">Trace ID</TableHead>
                    <TableHead className="font-medium">Timestamp</TableHead>
                    <TableHead className="font-medium">Client App Name</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {traceIds.map((trace) => (
                    <TableRow key={trace.id} onClick={() => handleTraceClick(trace.id)} className="cursor-pointer">
                      <TableCell className="font-medium">{truncateTraceId(trace.id)}</TableCell>
                      <TableCell>{formatDate(trace.timestamp)}</TableCell>
                      <TableCell>{trace.clientAppName}</TableCell>
                      <TableCell>
                        <Badge variant={trace.status === 'success' ? 'success' : 'error'}>
                          {trace.status}
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

export default TraceIdsPage;