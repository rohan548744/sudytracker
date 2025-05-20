import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useScheduleState } from "@/hooks/use-schedule";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubjects } from "@/hooks/use-subjects";
import { useUser } from "@/contexts/user-context";
import { formatDate } from "@/lib/dateUtils";
import ScheduleItem from "@/components/ui/schedule-item";

const Schedule = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { subjects } = useSubjects();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  
  const { 
    sessions, 
    addSession, 
    updateSession, 
    deleteSession,
    getSessionsByDate
  } = useScheduleState();

  // Sessions for the selected date
  const dateString = formatDate(selectedDate);
  const selectedDateSessions = getSessionsByDate(dateString);

  // Session form schema
  const sessionSchema = z.object({
    subjectId: z.number({ required_error: "Please select a subject" }),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    location: z.string().optional(),
    startTime: z.string().min(1, "Please select a start time"),
    endTime: z.string().min(1, "Please select an end time").refine(
      (time, ctx) => {
        const startTime = ctx.path?.[0]?.value?.startTime;
        if (startTime && time <= startTime) {
          return false;
        }
        return true;
      },
      {
        message: "End time must be after start time",
        path: ["endTime"],
      }
    ),
    date: z.string().min(1, "Please select a date"),
    participants: z.number().optional(),
  });

  type SessionFormValues = z.infer<typeof sessionSchema>;

  const defaultValues: SessionFormValues = {
    title: "",
    description: "",
    location: "",
    subjectId: subjects.length > 0 ? subjects[0].id : 0,
    startTime: "09:00",
    endTime: "10:00",
    date: formatDate(selectedDate),
    participants: undefined,
  };

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues,
  });

  // Handle session form submission
  const handleSubmitSession = (data: SessionFormValues) => {
    if (editingSession) {
      updateSession(editingSession.id, {
        ...data,
        userId: user.id,
        completed: editingSession.completed,
      });
      
      toast({
        title: "Session Updated",
        description: "Study session has been updated successfully",
      });
      
      setEditingSession(null);
    } else {
      addSession({
        ...data,
        userId: user.id,
        completed: false,
      });
      
      toast({
        title: "Session Created",
        description: "New study session has been added to your schedule",
      });
    }
    
    setIsSessionModalOpen(false);
  };

  // Edit session handler
  const handleEditSession = (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setEditingSession(session);
      form.reset({
        ...session,
        subjectId: session.subjectId,
      });
      setIsSessionModalOpen(true);
    }
  };

  // Delete session handler
  const handleDeleteSession = (sessionId: number) => {
    deleteSession(sessionId);
    
    toast({
      title: "Session Deleted",
      description: "Study session has been removed from your schedule",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Study Schedule</h2>
        <Button 
          className="primary-button mt-4 sm:mt-0"
          onClick={() => {
            setEditingSession(null);
            form.reset(defaultValues);
            form.setValue("date", formatDate(selectedDate));
            setIsSessionModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon="plus" className="mr-2" />
          Add Study Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Sessions for selected date */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-medium">
              Sessions for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          
          <div className="p-6">
            {selectedDateSessions.length > 0 ? (
              selectedDateSessions.map(session => (
                <div key={session.id} className="relative group">
                  <ScheduleItem session={session} />
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button 
                      className="p-1.5 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      onClick={() => handleEditSession(session.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      className="p-1.5 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No study sessions scheduled for this date. Click "Add Study Session" to create one.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Session Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Study Session" : "Create Study Session"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitSession)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Session description" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Study location" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          placeholder="Number of participants"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsSessionModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSession ? "Save Changes" : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
