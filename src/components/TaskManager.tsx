"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  dueDate?: Date;
}

interface TaskManagerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function TaskManager({ isVisible, onToggle }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'System Diagnostics',
      description: 'Run comprehensive system health check',
      completed: false,
      priority: 'high',
      category: 'System',
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    },
    {
      id: '2',
      title: 'Security Update',
      description: 'Install latest security patches',
      completed: true,
      priority: 'high',
      category: 'Security',
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: '3',
      title: 'Database Backup',
      description: 'Backup all user data and configurations',
      completed: false,
      priority: 'medium',
      category: 'Maintenance',
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
  ]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      priority: selectedPriority,
      category: 'General',
      createdAt: new Date()
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      'System': 'text-blue-400 bg-blue-400/20',
      'Security': 'text-red-400 bg-red-400/20', 
      'Maintenance': 'text-yellow-400 bg-yellow-400/20',
      'General': 'text-purple-400 bg-purple-400/20'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-400/20';
  };

  const formatTimeUntilDue = (dueDate: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) return 'Overdue';
    if (diffInMinutes < 60) return `${diffInMinutes}m left`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h left`;
    return `${Math.floor(diffInMinutes / 1440)}d left`;
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'completed') return task.completed;
    if (selectedCategory === 'pending') return !task.completed;
    return task.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const categories = ['all', 'pending', 'completed', ...Array.from(new Set(tasks.map(t => t.category)))];

  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-purple-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">TASK MANAGER</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-yellow-400/80">
            {tasks.filter(t => !t.completed).length} pending • {tasks.filter(t => t.completed).length} completed
          </div>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-400/20"
          >
            Hide
          </Button>
        </div>
      </div>

      {/* Add New Task */}
      <Card className="bg-black/40 border-yellow-400/30 p-4 hologram-effect">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">Add New Task</h3>
        <div className="flex gap-4">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task description..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 bg-black/50 border-yellow-400/50 text-yellow-100 placeholder:text-yellow-400/60"
          />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 bg-black/50 border border-yellow-400/50 rounded text-yellow-100 text-sm"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <Button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 hover:bg-yellow-400/30"
          >
            Add Task
          </Button>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            className={`${
              selectedCategory === category
                ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400'
                : 'border-yellow-400/50 text-yellow-400/80 hover:bg-yellow-400/10'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <Card className="bg-black/40 border-yellow-400/30 hologram-effect">
        <div className="p-4 border-b border-yellow-400/30">
          <h3 className="text-lg font-semibold text-yellow-400">
            Tasks ({filteredTasks.length})
          </h3>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-yellow-400/60 text-lg mb-2">No tasks found</div>
              <div className="text-yellow-400/40 text-sm">
                {selectedCategory === 'all' 
                  ? 'Add a new task to get started'
                  : `No ${selectedCategory} tasks available`
                }
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded border transition-all duration-300 slide-in ${
                  task.completed 
                    ? 'bg-green-400/5 border-green-400/20' 
                    : 'bg-black/30 border-yellow-400/20 hover:border-yellow-400/40'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                      {task.dueDate && !task.completed && (
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          new Date(task.dueDate) < new Date() 
                            ? 'text-red-400 bg-red-400/20' 
                            : 'text-blue-400 bg-blue-400/20'
                        }`}>
                          {formatTimeUntilDue(task.dueDate)}
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`font-semibold mb-1 ${
                      task.completed 
                        ? 'text-green-400/80 line-through' 
                        : 'text-yellow-100'
                    }`}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                      <p className={`text-sm ${
                        task.completed 
                          ? 'text-green-400/60' 
                          : 'text-yellow-400/80'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-yellow-400/60">
                        Created: {task.createdAt.toLocaleString()}
                      </span>
                      <Button
                        onClick={() => deleteTask(task.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-400/50 text-red-400 hover:bg-red-400/20 text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}