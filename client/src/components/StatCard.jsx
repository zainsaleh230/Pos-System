import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color, subValue }) => {
  return (
    <div className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
        </div>
        <div className={`p-3 rounded-full ${color || 'bg-blue-50 text-blue-600'}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {(trend || subValue) && (
        <div className="flex items-center text-sm">
          {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />}
          {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
          <span className={`font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {subValue}
          </span>
          <span className="text-gray-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
