import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePomodoroTimer } from "@/hooks/use-pomodoro";

const PomodoroTimer = () => {
  const { 
    time, 
    mode, 
    isActive, 
    progress,
    start, 
    pause, 
    reset, 
    setMode 
  } = usePomodoroTimer();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-medium">Pomodoro Timer</h3>
      </div>
      <div className="p-6 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <div className="absolute inset-0 rounded-full bg-gray-100"></div>
          <div 
            className="absolute inset-0 rounded-full border-8 border-primary-500" 
            style={{ 
              clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)` 
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold">{time}</p>
              <p className="text-sm text-gray-500">
                {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={start}
            disabled={isActive}
          >
            <FontAwesomeIcon icon="play" />
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={pause}
            disabled={!isActive}
          >
            <FontAwesomeIcon icon="pause" />
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={reset}
          >
            <FontAwesomeIcon icon="redo-alt" />
          </button>
        </div>
        
        <div className="w-full grid grid-cols-3 gap-2">
          <button 
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              mode === 'focus' 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setMode('focus')}
          >
            Focus
          </button>
          <button 
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              mode === 'shortBreak' 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setMode('shortBreak')}
          >
            Short Break
          </button>
          <button 
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              mode === 'longBreak' 
                ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => setMode('longBreak')}
          >
            Long Break
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
