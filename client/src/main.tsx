import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import FontAwesome for icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { 
  faHome, faTasks, faCalendarAlt, faClock, faBook, faChartLine, 
  faPlus, faPlay, faCheck, faFire, faMapMarkerAlt, faUsers, 
  faArrowRight, faTimes, faEllipsisV, faPause, faRedoAlt, 
  faCheckCircle, faCog, faBookOpen
} from "@fortawesome/free-solid-svg-icons";

// Add icons to the library
library.add(
  faHome, faTasks, faCalendarAlt, faClock, faBook, faChartLine, 
  faPlus, faPlay, faCheck, faFire, faMapMarkerAlt, faUsers, 
  faArrowRight, faTimes, faEllipsisV, faPause, faRedoAlt, 
  faCheckCircle, faCog, faBookOpen
);

createRoot(document.getElementById("root")!).render(<App />);
