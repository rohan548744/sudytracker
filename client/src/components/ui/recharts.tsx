import React from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Bar Chart Component
interface BarChartProps {
  data: any[];
  options?: any;
  height?: number;
}

export const CustomBarChart = ({ data, options = {}, height = 300 }: BarChartProps) => {
  const { indexAxis = 'x', plugins = {}, scales = {} } = options;
  const dataKey = data.datasets[0].label || 'value';
  const isHorizontal = indexAxis === 'y';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data.labels.map((label, index) => ({
          name: label,
          [dataKey]: data.datasets[0].data[index]
        }))}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {isHorizontal ? (
          <>
            <XAxis type="number" domain={[0, 'auto']} />
            <YAxis dataKey="name" type="category" />
          </>
        ) : (
          <>
            <XAxis dataKey="name" />
            <YAxis />
          </>
        )}
        <Tooltip formatter={(value) => {
          if (options.plugins?.tooltip?.callbacks?.label) {
            return options.plugins.tooltip.callbacks.label({ raw: value });
          }
          return value;
        }} />
        {!plugins.legend?.display === false && <Legend />}
        <Bar 
          dataKey={dataKey} 
          fill={data.datasets[0].backgroundColor[0] || "#8884d8"} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Line Chart Component
interface LineChartProps {
  data: any[];
  options?: any;
  height?: number;
}

export const CustomLineChart = ({ data, options = {}, height = 300 }: LineChartProps) => {
  const { plugins = {}, scales = {} } = options;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data.labels.map((label, index) => ({
          name: label,
          ...data.datasets.reduce((acc, dataset, i) => {
            acc[dataset.label || `dataset${i}`] = dataset.data[index];
            return acc;
          }, {})
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {!plugins.legend?.display === false && <Legend />}
        {data.datasets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label || `dataset${index}`}
            stroke={dataset.borderColor || "#8884d8"}
            fill={dataset.backgroundColor}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Area Chart Component
interface AreaChartProps {
  data: any[];
  options?: any;
  height?: number;
}

export const CustomAreaChart = ({ data, options = {}, height = 300 }: AreaChartProps) => {
  const { plugins = {}, scales = {} } = options;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data.labels.map((label, index) => ({
          name: label,
          ...data.datasets.reduce((acc, dataset, i) => {
            acc[dataset.label || `dataset${i}`] = dataset.data[index];
            return acc;
          }, {})
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {!plugins.legend?.display === false && <Legend />}
        {data.datasets.map((dataset, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey={dataset.label || `dataset${index}`}
            stroke={dataset.borderColor || "#8884d8"}
            fill={dataset.backgroundColor || "rgba(136, 132, 216, 0.3)"}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Pie/Doughnut Chart Component
interface PieChartProps {
  data: any[];
  options?: any;
  height?: number;
  doughnut?: boolean;
}

export const CustomPieChart = ({ data, options = {}, height = 300, doughnut = false }: PieChartProps) => {
  const { plugins = {} } = options;
  const pieData = data.labels.map((label, index) => ({
    name: label,
    value: data.datasets[0].data[index]
  }));
  
  const innerRadius = doughnut ? (options.cutout ? parseInt(options.cutout) : 60) : 0;
  const outerRadius = 80;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        {plugins.legend?.position !== 'none' && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
};

// Cell component for pie chart colors
import { Cell } from 'recharts';

// Chart wrapper that selects the appropriate chart type
interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  data: any;
  options?: any;
  height?: number;
}

export const Chart = ({ type, data, options = {}, height = 300 }: ChartProps) => {
  switch (type) {
    case 'bar':
      return <CustomBarChart data={data} options={options} height={height} />;
    case 'line':
      return <CustomLineChart data={data} options={options} height={height} />;
    case 'area':
      return <CustomAreaChart data={data} options={options} height={height} />;
    case 'pie':
      return <CustomPieChart data={data} options={options} height={height} />;
    case 'doughnut':
      return <CustomPieChart data={data} options={options} height={height} doughnut={true} />;
    default:
      return <div>Unsupported chart type: {type}</div>;
  }
};