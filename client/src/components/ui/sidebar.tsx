import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "@/contexts/user-context";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "home" },
    { path: "/tasks", label: "Tasks", icon: "tasks" },
    { path: "/schedule", label: "Schedule", icon: "calendar-alt" },
    { path: "/pomodoro", label: "Pomodoro Timer", icon: "clock" },
    { path: "/subjects", label: "Subjects", icon: "book" },
    { path: "/progress", label: "Progress", icon: "chart-line" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center">
          <FontAwesomeIcon icon="book-open" className="mr-2" />
          StudyDeep
        </h1>
        <button onClick={toggleMobileMenu} className="p-2 text-gray-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar for both mobile and desktop */}
      <aside className={`
        w-full md:w-64 bg-white shadow-md 
        md:flex md:flex-col md:min-h-screen md:fixed
        ${isMobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden md:flex'}
      `}>
        {/* Mobile close button */}
        {isMobileMenuOpen && (
          <div className="md:hidden p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600 flex items-center">
              <FontAwesomeIcon icon="book-open" className="mr-2" />
              StudyDeep
            </h1>
            <button onClick={toggleMobileMenu} className="p-2 text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Desktop header */}
        <div className="hidden md:block p-4 border-b">
          <h1 className="text-2xl font-bold text-primary-600 flex items-center">
            <FontAwesomeIcon icon="book-open" className="mr-2" />
            StudyDeep
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`sidebar-link ${location === item.path ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
                  <span className="ml-2">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FontAwesomeIcon icon="cog" className="mr-2" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
