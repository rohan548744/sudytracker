import { useEffect, useRef } from "react";
import { StudyTimeRecord } from "@shared/schema";
import { getDayName, formatHoursMinutes } from "@/lib/dateUtils";

interface WeeklyProgressChartProps {
  records: StudyTimeRecord[];
  startDate: string;
  endDate: string;
}

const WeeklyProgressChart = ({ records, startDate, endDate }: WeeklyProgressChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Group records by day and calculate total study time per day
  const calculateDailyHours = (): number[] => {
    const dailyData = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    
    records.forEach(record => {
      const date = new Date(record.date);
      const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
      const hoursStudied = record.duration / 60; // Convert minutes to hours
      
      dailyData[dayIndex] += hoursStudied;
    });
    
    return dailyData;
  };
  
  // Calculate stats
  const getTotalHours = (): string => {
    const totalMinutes = records.reduce((total, record) => total + record.duration, 0);
    return formatHoursMinutes(totalMinutes);
  };
  
  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dailyData = calculateDailyHours();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate chart dimensions
    const barWidth = (canvasWidth / dailyData.length) * 0.6;
    const spacing = (canvasWidth / dailyData.length) * 0.4;
    const maxValue = Math.max(...dailyData, 1); // Ensure we don't divide by zero
    const scaleFactor = (canvasHeight - 40) / maxValue;
    
    // Draw bars
    dailyData.forEach((value, index) => {
      const barHeight = value * scaleFactor;
      const xPos = (index * (barWidth + spacing)) + (spacing / 2);
      const yPos = canvasHeight - barHeight - 20;
      
      // Bar gradient
      const gradient = ctx.createLinearGradient(0, yPos, 0, canvasHeight - 20);
      gradient.addColorStop(0, '#4F46E5'); // primary-600
      gradient.addColorStop(1, '#818CF8'); // primary-400
      
      ctx.fillStyle = gradient;
      ctx.fillRect(xPos, yPos, barWidth, barHeight);
      
      // Draw value on top of bar
      ctx.fillStyle = '#6B7280'; // gray-500
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1) + 'h', xPos + barWidth / 2, yPos - 5);
    });
  }, [records]);
  
  // Generate day names for the current week
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return getDayName(date);
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-medium">Weekly Progress</h3>
      </div>
      <div className="p-6">
        <div className="w-full h-48 mb-4">
          <canvas ref={canvasRef} width="300" height="200"></canvas>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          {dayNames.map((day, i) => (
            <span key={i}>{day}</span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-xl font-semibold">{getTotalHours()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Tasks Completed</p>
            <p className="text-xl font-semibold">
              {records.filter(r => r.taskId !== null).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
