import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatTimeToDisplayTime, calculateDuration } from "@/lib/dateUtils";
import { StudySession } from "@shared/schema";

interface ScheduleItemProps {
  session: StudySession;
}

const ScheduleItem = ({ session }: ScheduleItemProps) => {
  const { title, description, location, startTime, endTime, subjectId, participants } = session;
  
  // Convert subject ID to color based on subject type
  const getSubjectColorClasses = (subjectId: number) => {
    // This would be replaced with actual logic based on the subject data
    const colorMap = {
      1: { bg: "bg-blue-50", border: "border-primary-600" },
      2: { bg: "bg-purple-50", border: "border-secondary-500" },
      3: { bg: "bg-green-50", border: "border-green-500" },
    };
    
    return colorMap[subjectId] || { bg: "bg-gray-50", border: "border-gray-500" };
  };

  const colorClasses = getSubjectColorClasses(subjectId);
  const duration = calculateDuration(startTime, endTime);
  const formattedStartTime = formatTimeToDisplayTime(startTime);
  const formattedEndTime = formatTimeToDisplayTime(endTime);

  return (
    <div className="flex mb-4 last:mb-0">
      <div className="flex flex-col items-center mr-4">
        <span className="text-sm font-medium text-gray-500">{formattedStartTime}</span>
        <div className="flex-grow border-l border-dashed border-gray-300 my-1"></div>
        <span className="text-sm font-medium text-gray-500">{formattedEndTime}</span>
      </div>
      <div className={`flex-grow ${colorClasses.bg} rounded-lg p-3 border-l-4 ${colorClasses.border}`}>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="mt-2 flex justify-between">
          <span className="text-xs text-gray-500">
            {location ? (
              <>
                <FontAwesomeIcon icon="map-marker-alt" className="mr-1" /> {location}
              </>
            ) : participants ? (
              <>
                <FontAwesomeIcon icon="users" className="mr-1" /> {participants} people
              </>
            ) : null}
          </span>
          <span className={`text-xs ${colorClasses.border.replace('border', 'text')} font-medium`}>
            {duration}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleItem;
