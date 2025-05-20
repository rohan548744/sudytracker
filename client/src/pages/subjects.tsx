import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSubjects } from "@/hooks/use-subjects";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/contexts/user-context";

const Subjects = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects();
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Color options for subjects
  const colorOptions = [
    { name: "Blue", value: "blue" },
    { name: "Purple", value: "purple" },
    { name: "Green", value: "green" },
    { name: "Red", value: "red" },
    { name: "Yellow", value: "yellow" },
    { name: "Indigo", value: "indigo" },
    { name: "Pink", value: "pink" },
  ];

  // Subject form schema
  const subjectSchema = z.object({
    name: z.string().min(3, "Subject name must be at least 3 characters"),
    color: z.string().min(1, "Please select a color"),
    description: z.string().optional(),
  });

  type SubjectFormValues = z.infer<typeof subjectSchema>;

  const defaultValues: SubjectFormValues = {
    name: "",
    color: "blue",
    description: "",
  };

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues,
  });

  // Handle subject form submission
  const handleSubmitSubject = (data: SubjectFormValues) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        ...data,
        userId: user.id,
      });
      
      toast({
        title: "Subject Updated",
        description: "Subject has been updated successfully",
      });
      
      setEditingSubject(null);
    } else {
      addSubject({
        ...data,
        userId: user.id,
      });
      
      toast({
        title: "Subject Created",
        description: "New subject has been added",
      });
    }
    
    setIsSubjectModalOpen(false);
    form.reset(defaultValues);
  };

  // Edit subject handler
  const handleEditSubject = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setEditingSubject(subject);
      form.reset({
        name: subject.name,
        color: subject.color,
        description: subject.description || "",
      });
      setIsSubjectModalOpen(true);
    }
  };

  // Delete subject handler
  const handleDeleteSubject = (subjectId: number) => {
    deleteSubject(subjectId);
    
    toast({
      title: "Subject Deleted",
      description: "Subject has been removed",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Subject Management</h2>
        <Button 
          className="primary-button mt-4 sm:mt-0"
          onClick={() => {
            setEditingSubject(null);
            form.reset(defaultValues);
            setIsSubjectModalOpen(true);
          }}
        >
          <FontAwesomeIcon icon="plus" className="mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map(subject => (
            <Card key={subject.id} className={`border-l-4 border-${subject.color}-500`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-medium">{subject.name}</h3>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditSubject(subject.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {subject.description || "No description provided"}
                </p>
                
                <div className="mt-4 flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${subject.color}-500 mr-2`}></div>
                  <span className="text-xs text-gray-500">
                    {colorOptions.find(c => c.value === subject.color)?.name || "Color"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="lg:col-span-3 text-center py-10 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new subject.</p>
            <div className="mt-6">
              <Button 
                onClick={() => {
                  setEditingSubject(null);
                  form.reset(defaultValues);
                  setIsSubjectModalOpen(true);
                }}
              >
                <FontAwesomeIcon icon="plus" className="mr-2" />
                New Subject
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Subject Modal */}
      <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Create Subject"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitSubject)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Calculus, Physics, Literature" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the subject" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="grid grid-cols-7 gap-2">
                      {colorOptions.map(color => (
                        <div
                          key={color.value}
                          className={`
                            h-10 rounded-md cursor-pointer border-2 transition-all
                            ${field.value === color.value ? `border-${color.value}-500 ring-2 ring-${color.value}-500 ring-opacity-50` : 'border-transparent'}
                          `}
                          style={{
                            backgroundColor: `var(--${color.value}-100)`,
                            borderColor: field.value === color.value ? `var(--${color.value}-500)` : 'transparent'
                          }}
                          onClick={() => field.onChange(color.value)}
                        ></div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsSubjectModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubject ? "Save Changes" : "Create Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;
