import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task, Subject } from "@shared/schema";
import { formatDate, getDaysLeft } from "@/lib/dateUtils";

interface DeadlineItemProps {
  task: Task;
  subject: Subject;
}

const DeadlineItem = ({ task, subject }: DeadlineItemProps) => {
  const { title, dueDate } = task;
  const daysLeft = getDaysLeft(dueDate);
  
  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft <= 2) return "bg-red-500";
    if (daysLeft <= 5) return "bg-yellow-500";
    return "bg-blue-500";
  };
  
  const getDeadlineText = (daysLeft: number) => {
    if (daysLeft === 0) return "Today";
    if (daysLeft === 1) return "1 day left";
    if (daysLeft < 7) return `${daysLeft} days left`;
    return "1 week left";
  };
  
  const deadlineColor = getDeadlineColor(daysLeft);
  const deadlineText = getDeadlineText(daysLeft);
  const formattedDate = formatDate(dueDate);

  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium">{title}</h4>
        <span className={`text-xs font-medium text-white ${deadlineColor} px-2 py-0.5 rounded-full`}>
          {deadlineText}
        </span>
      </div>
      <p className="text-sm text-gray-600">{subject.name}</p>
      <div className="mt-1 flex items-center text-xs text-gray-500">
        <FontAwesomeIcon icon="calendar-day" className="mr-1" />
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default DeadlineItem;
