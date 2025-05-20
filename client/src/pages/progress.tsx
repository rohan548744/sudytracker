import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStatsState } from "@/hooks/use-stats";
import { useSubjects } from "@/hooks/use-subjects";
import { useTaskState } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chart as ChartComponent } from "@/components/ui/recharts";

const Progress = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [subjectFilter, setSubjectFilter] = useState("all");
  
  const { subjects } = useSubjects();
  const { tasks } = useTaskState();
  const { 
    stats,
    weeklyRecords,
    monthlyRecords,
    weeklyTaskCompletion,
    subjectDistribution 
  } = useStatsState();

  // Filter records based on subject if needed
  const filterRecordsBySubject = (records) => {
    if (subjectFilter === "all") return records;
    return records.filter(record => record.subjectId.toString() === subjectFilter);
  };

  // Get filtered data based on time range and subject
  const getFilteredData = () => {
    switch(timeRange) {
      case "week":
        return filterRecordsBySubject(weeklyRecords);
      case "month":
        return filterRecordsBySubject(monthlyRecords);
      default:
        return filterRecordsBySubject(weeklyRecords);
    }
  };

  const filteredData = getFilteredData();

  // Calculate study time per subject
  const calculateStudyTimePerSubject = () => {
    const timePerSubject = {};

    // Initialize with all subjects
    subjects.forEach(subject => {
      timePerSubject[subject.id] = 0;
    });

    // Sum up study time
    filteredData.forEach(record => {
      if (timePerSubject[record.subjectId] !== undefined) {
        timePerSubject[record.subjectId] += record.duration;
      }
    });

    return timePerSubject;
  };

  const studyTimePerSubject = calculateStudyTimePerSubject();

  // Format time (minutes to hours and minutes)
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Prepare data for study time by subject chart
  const prepareSubjectTimeChartData = () => {
    return {
      labels: subjects.map(subject => subject.name),
      datasets: [
        {
          label: 'Study Time (minutes)',
          data: subjects.map(subject => studyTimePerSubject[subject.id] || 0),
          backgroundColor: subjects.map(subject => `var(--${subject.color}-400)`),
          borderWidth: 0,
        },
      ],
    };
  };

  // Prepare data for task completion chart
  const prepareTaskCompletionChartData = () => {
    return {
      labels: ['Completed', 'In Progress'],
      datasets: [
        {
          data: [
            tasks.filter(task => task.completed).length,
            tasks.filter(task => !task.completed).length
          ],
          backgroundColor: ['var(--chart-1)', 'var(--chart-2)'],
          borderWidth: 0,
        },
      ],
    };
  };

  // Prepare data for study time trend chart (daily)
  const prepareStudyTimeTrendChartData = () => {
    const currentDate = new Date();
    const labels = [];
    const data = Array(7).fill(0);
    
    // Create labels for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    // Sum up study time for each day
    filteredData.forEach(record => {
      const recordDate = new Date(record.date);
      const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 7) {
        data[6 - diffDays] += record.duration / 60; // Convert to hours
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Study Hours',
          data,
          borderColor: 'var(--primary)',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Prepare data for focus score chart
  const prepareFocusScoreChartData = () => {
    const labels = [];
    const data = [];
    
    if (filteredData.length > 0) {
      // Group by date and calculate average focus score
      const dateScores = {};
      
      filteredData.forEach(record => {
        if (!dateScores[record.date]) {
          dateScores[record.date] = { total: 0, count: 0 };
        }
        
        if (record.focusScore) {
          dateScores[record.date].total += record.focusScore;
          dateScores[record.date].count++;
        }
      });
      
      // Convert to arrays for the chart
      Object.keys(dateScores).sort().forEach(date => {
        const avg = dateScores[date].count > 0 ? 
          Math.round(dateScores[date].total / dateScores[date].count) : 0;
        
        labels.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(avg);
      });
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Focus Score',
          data,
          borderColor: 'var(--chart-3)',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const subjectTimeChartData = prepareSubjectTimeChartData();
  const taskCompletionChartData = prepareTaskCompletionChartData();
  const studyTimeTrendChartData = prepareStudyTimeTrendChartData();
  const focusScoreChartData = prepareFocusScoreChartData();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Progress Analytics</h2>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
          <Select 
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={subjectFilter}
            onValueChange={setSubjectFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-primary-100 text-primary-600">
              <FontAwesomeIcon icon="clock" className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Total Study Time</p>
              <p className="text-2xl font-semibold">
                {formatTime(filteredData.reduce((total, record) => total + record.duration, 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-100 text-green-600">
              <FontAwesomeIcon icon="check" className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Tasks Completed</p>
              <p className="text-2xl font-semibold">
                {tasks.filter(task => task.completed).length}/{tasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-secondary-100 text-secondary-600">
              <FontAwesomeIcon icon="calendar-alt" className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Study Streak</p>
              <p className="text-2xl font-semibold">{stats.streak} days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-100 text-yellow-600">
              <FontAwesomeIcon icon="fire" className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">Avg. Focus Score</p>
              <p className="text-2xl font-semibold">{stats.focusScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartComponent 
                type="bar" 
                data={subjectTimeChartData} 
                options={{
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw;
                          return formatTime(value);
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Minutes'
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex justify-center items-center">
              <div className="w-64">
                <ChartComponent 
                  type="doughnut" 
                  data={taskCompletionChartData} 
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Study Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartComponent 
                type="line" 
                data={studyTimeTrendChartData} 
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Hours'
                      },
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Focus Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartComponent 
                type="line" 
                data={focusScoreChartData} 
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Score (0-100)'
                      },
                      min: 0,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bySubject">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bySubject">By Subject</TabsTrigger>
              <TabsTrigger value="byDay">By Day</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bySubject" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Subject</th>
                      <th className="text-center py-3 px-4">Sessions</th>
                      <th className="text-center py-3 px-4">Total Time</th>
                      <th className="text-center py-3 px-4">Avg. Focus Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => {
                      const subjectRecords = filteredData.filter(r => r.subjectId === subject.id);
                      const totalTime = subjectRecords.reduce((sum, r) => sum + r.duration, 0);
                      const focusScores = subjectRecords.filter(r => r.focusScore).map(r => r.focusScore);
                      const avgFocusScore = focusScores.length > 0 ? 
                        Math.round(focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length) : 
                        'N/A';
                      
                      return (
                        <tr key={subject.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full bg-${subject.color}-500 mr-2`}></div>
                              {subject.name}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">{subjectRecords.length}</td>
                          <td className="text-center py-3 px-4">{formatTime(totalTime)}</td>
                          <td className="text-center py-3 px-4">{avgFocusScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="byDay" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-center py-3 px-4">Sessions</th>
                      <th className="text-center py-3 px-4">Total Time</th>
                      <th className="text-center py-3 px-4">Avg. Focus Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Group records by date
                      const recordsByDate = {};
                      
                      filteredData.forEach(record => {
                        if (!recordsByDate[record.date]) {
                          recordsByDate[record.date] = [];
                        }
                        recordsByDate[record.date].push(record);
                      });
                      
                      return Object.keys(recordsByDate)
                        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                        .map(date => {
                          const dayRecords = recordsByDate[date];
                          const totalTime = dayRecords.reduce((sum, r) => sum + r.duration, 0);
                          const focusScores = dayRecords.filter(r => r.focusScore).map(r => r.focusScore);
                          const avgFocusScore = focusScores.length > 0 ? 
                            Math.round(focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length) : 
                            'N/A';
                          
                          return (
                            <tr key={date} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                {new Date(date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </td>
                              <td className="text-center py-3 px-4">{dayRecords.length}</td>
                              <td className="text-center py-3 px-4">{formatTime(totalTime)}</td>
                              <td className="text-center py-3 px-4">{avgFocusScore}</td>
                            </tr>
                          );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Progress;
