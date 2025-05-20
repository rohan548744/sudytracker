import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface StatCardProps {
  title: string;
  value: string;
  icon: IconName;
  color: "primary" | "green" | "secondary" | "yellow";
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colors = {
    primary: {
      bg: "bg-primary-100",
      text: "text-primary-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
    },
    secondary: {
      bg: "bg-secondary-100",
      text: "text-secondary-600",
    },
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center">
      <div className={`rounded-full h-12 w-12 flex items-center justify-center ${colors[color].bg} ${colors[color].text}`}>
        <FontAwesomeIcon icon={icon} className="text-xl" />
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
