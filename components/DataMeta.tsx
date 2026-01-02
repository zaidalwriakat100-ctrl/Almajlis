
import React from 'react';
import { Database, Clock, AlertCircle } from 'lucide-react';

interface DataMetaProps {
  source?: string;
  lastUpdated?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

const DataMeta: React.FC<DataMetaProps> = ({ 
  source, 
  lastUpdated, 
  variant = 'light',
  className = ''
}) => {
  const baseColor = variant === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const iconColor = variant === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const borderColor = variant === 'dark' ? 'border-slate-700' : 'border-slate-100';

  return (
    <div className={`flex flex-wrap gap-4 text-xs ${baseColor} ${className}`}>
      {source && (
        <div className="flex items-center gap-1.5" title="مصدر البيانات">
          <Database size={12} className={iconColor} />
          <span>المصدر: {source}</span>
        </div>
      )}
      
      {lastUpdated && (
        <div className="flex items-center gap-1.5" title="تاريخ آخر تحديث">
          <Clock size={12} className={iconColor} />
          <span>آخر تحديث: {new Date(lastUpdated).toLocaleDateString('ar-JO')}</span>
        </div>
      )}

      {(!source && !lastUpdated) && (
        <div className="flex items-center gap-1.5 opacity-50">
             <AlertCircle size={12} />
             <span>بيانات غير موثقة المصدر</span>
        </div>
      )}
    </div>
  );
};

export default DataMeta;
