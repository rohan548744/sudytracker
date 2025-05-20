import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePomodoroTimer } from "@/hooks/use-pomodoro";
import { useTaskState } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const Pomodoro = () => {
  const { 
    time, 
    mode, 
    isActive, 
    progress,
    settings,
    completedSessions,
    totalSessionTime,
    start, 
    pause, 
    reset, 
    setMode,
    updateSettings,
    skipToNext,
  } = usePomodoroTimer();

  const { tasks } = useTaskState();
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Only show incomplete tasks for selection
  const availableTasks = tasks.filter(task => !task.completed);

  // Format the total session time
  const formatTotalTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pomodoro Timer</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Focus Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-56 h-56 mb-8">
                <div className="absolute inset-0 rounded-full bg-gray-100"></div>
                <div 
                  className="absolute inset-0 rounded-full border-8 border-primary-500" 
                  style={{ 
                    clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)` 
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold">{time}</p>
                    <p className="text-xl text-gray-500 mt-2">
                      {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-8">
                <Button
                  size="lg"
                  variant="default"
                  onClick={start}
                  disabled={isActive}
                >
                  <FontAwesomeIcon icon="play" className="mr-2" />
                  Start
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={pause}
                  disabled={!isActive}
                >
                  <FontAwesomeIcon icon="pause" className="mr-2" />
                  Pause
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={reset}
                >
                  <FontAwesomeIcon icon="redo-alt" className="mr-2" />
                  Reset
                </Button>
                {isActive && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={skipToNext}
                  >
                    <FontAwesomeIcon icon="forward" className="mr-2" />
                    Skip
                  </Button>
                )}
              </div>
              
              <div className="w-full grid grid-cols-3 gap-2 mb-8">
                <Button 
                  variant={mode === 'focus' ? "default" : "outline"}
                  onClick={() => setMode('focus')}
                >
                  Focus
                </Button>
                <Button 
                  variant={mode === 'shortBreak' ? "default" : "outline"}
                  onClick={() => setMode('shortBreak')}
                >
                  Short Break
                </Button>
                <Button 
                  variant={mode === 'longBreak' ? "default" : "outline"}
                  onClick={() => setMode('longBreak')}
                >
                  Long Break
                </Button>
              </div>
              
              {/* Task Selection */}
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Task (Optional)
                </label>
                <Select 
                  value={selectedTaskId} 
                  onValueChange={setSelectedTaskId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task for this session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific task</SelectItem>
                    {availableTasks.map(task => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Notes
                </label>
                <Input
                  as="textarea"
                  placeholder="Add notes about this study session"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Settings */}
        <div className="space-y-6">
          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Completed Sessions</p>
                  <p className="text-2xl font-semibold">{completedSessions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Focus Time</p>
                  <p className="text-2xl font-semibold">{formatTotalTime(totalSessionTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Duration: {settings.focusDuration} minutes
                  </label>
                  <Slider
                    value={[settings.focusDuration]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => updateSettings({ focusDuration: value[0] })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Break: {settings.shortBreakDuration} minutes
                  </label>
                  <Slider
                    value={[settings.shortBreakDuration]}
                    min={3}
                    max={15}
                    step={1}
                    onValueChange={(value) => updateSettings({ shortBreakDuration: value[0] })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long Break: {settings.longBreakDuration} minutes
                  </label>
                  <Slider
                    value={[settings.longBreakDuration]}
                    min={15}
                    max={30}
                    step={5}
                    onValueChange={(value) => updateSettings({ longBreakDuration: value[0] })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sessions Before Long Break: {settings.sessionsBeforeLongBreak}
                  </label>
                  <Slider
                    value={[settings.sessionsBeforeLongBreak]}
                    min={2}
                    max={6}
                    step={1}
                    onValueChange={(value) => updateSettings({ sessionsBeforeLongBreak: value[0] })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
