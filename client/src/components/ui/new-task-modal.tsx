import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertTask, insertTaskSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/user-context";
import { useSubjects } from "@/hooks/use-subjects";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<InsertTask, 'userId'>) => void;
  initialData?: Partial<InsertTask>;
  isEdit?: boolean;
}

const NewTaskModal = ({ open, onOpenChange, onSubmit, initialData, isEdit = false }: NewTaskModalProps) => {
  const { user } = useUser();
  const { subjects } = useSubjects();
  
  // Create extended schema with appropriate validations
  const taskValidationSchema = insertTaskSchema
    .omit({ userId: true })
    .extend({
      subjectId: z.number({ required_error: "Please select a subject" }),
      title: z.string().min(3, "Title must be at least 3 characters"),
      description: z.string().optional(),
      priority: z.enum(["high", "medium", "low"], { required_error: "Please select a priority level" }),
      dueDate: z.string().min(1, "Please select a due date"),
      estimatedTime: z.number().min(1, "Estimated time must be at least 1 minute").optional(),
    });

  type TaskFormValues = z.infer<typeof taskValidationSchema>;

  // Set defaults for the form
  const defaultValues: TaskFormValues = {
    title: "",
    description: "",
    subjectId: subjects.length > 0 ? subjects[0].id : 0,
    priority: "medium",
    dueDate: new Date().toISOString().split('T')[0],
    estimatedTime: 60,
    completed: false,
    ...initialData
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskValidationSchema),
    defaultValues,
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && open) {
      form.reset({
        ...defaultValues,
        ...initialData,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit(data);
    onOpenChange(false);
    if (!isEdit) {
      form.reset(defaultValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
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
                    <Textarea placeholder="Task description" {...field} />
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
                      value={field.value.toString()}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Time (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskModal;
