import { Card, Progress } from 'antd';
import { BookOpen, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types/types.ts';

const CourseCard = ({ course, isDark }: { course: Course; isDark: boolean }) => {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#22c55e';
    if (progress >= 50) return '#8b5cf6';
    if (progress > 0) return '#f59e0b';
    return '#64748b';
  };

  return (
    <Link to={`/courses/${course.id}`} className="block">
      <Card
      hoverable
      className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isDark
          ? 'bg-slate-800/50 border-white/[0.08] hover:border-purple-500/30'
          : 'bg-white border-slate-200 hover:border-purple-300'
      }`}
      styles={{
        body: { padding: 0 },
      }}
      cover={
        <div className="relative overflow-hidden">
          <img
            alt={course.title}
            src={course.thumbnailUrl}
            className="w-full h-44 object-cover transition-transform duration-500 hover:scale-110"
          />
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {course.category}
          </span>
          {/* Progress badge */}
          {course.progress === 100 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Completed
            </span>
          )}
        </div>
      }
    >
      <div className="p-5">
        {/* Title */}
        <h3
          className={`text-lg font-semibold mb-2 line-clamp-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-1.5 mb-3">
          <User className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'Unknown Instructor'}
          </span>
        </div>

        <p
          className={`text-sm mb-4 line-clamp-2 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {course.duration}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {course.lessonsCount} lessons
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Progress
            </span>
            <span
              className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              {course.progress}%
            </span>
          </div>
          <Progress
            percent={course.progress}
            showInfo={false}
            strokeColor={getProgressColor(course.progress)}
            trailColor={isDark ? '#334155' : '#e2e8f0'}
            size="small"
          />
        </div>
      </div>
    </Card>
    </Link>
  );
};

export default CourseCard;