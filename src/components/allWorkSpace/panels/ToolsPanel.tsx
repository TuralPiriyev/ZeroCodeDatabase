import React, { useState } from 'react';
import { Plus, Code, Link, Download, Play, Database, Shield, Search, Settings, Users } from 'lucide-react';
import { useSubscription } from '../../../context/SubscriptionContext';
import ZeroCodeDDLBuilder from '../tools/ZeroCodeDDLBuilder';
import ZeroCodeCRUDBuilder from '../tools/ZeroCodeCRUDBuilder';
import VisualQueryBuilder from '../tools/VisualQueryBuilder';
import RelationshipPanel from '../tools/RelationshipPanel';
import SecurityManager from '../tools/SecurityManager';
import RealTimeCollaboration from '../tools/RealTimeCollaboration';
import ExportDropdown from '../tools/ExportDropdown';

type ActiveTool = 'ddl' | 'crud' | 'query' | 'relationship' | 'security' | 'team' | null;

interface ToolsPanelProps {
  collapsed?: boolean;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ collapsed = false }) => {
  const { currentPlan } = useSubscription();
  const [activeTool, setActiveTool] = useState<ActiveTool>('ddl');

  // Define tools with plan requirements
  const tools = [
    {
      id: 'ddl' as const,
      name: 'DDL Builder',
      icon: Database,
      description: 'Create, alter, and drop tables',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'crud' as const,
      name: 'Data Manager',
      icon: Plus,
      description: 'Insert, update, and delete data',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'query' as const,
      name: 'Query Builder',
      icon: Search,
      description: 'Build visual queries',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'relationship' as const,
      name: 'Relationships',
      icon: Link,
      description: 'Define table relationships',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'security' as const,
      name: 'Security',
      icon: Shield,
      description: 'Manage users and permissions',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      id: 'team' as const,
      name: 'Team Collaboration',
      icon: Users,
      description: 'Invite team members and manage workspace access',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    }
  ];

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 space-y-3 bg-white dark:bg-gray-900 pt-16 lg:pt-0">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110
                ${activeTool === tool.id
                  ? `${tool.bgColor} ${tool.color} shadow-lg`
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
              title={tool.name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 pt-16 lg:pt-0">
      {/* Horizontal Tool Tabs - Şəkildəki kimi */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            Database Tools
          </h2>
          
          {/* Horizontal scrollable tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                    transition-all duration-200 hover:scale-105 flex-shrink-0
                    ${isActive
                      ? `${tool.bgColor} ${tool.color} ${tool.borderColor} border-2 shadow-md`
                      : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                  title={tool.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTool === 'ddl' && (
          <div className="p-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">DDL Operations</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Create, modify, and manage your database table structures
              </p>
            </div>
            <ZeroCodeDDLBuilder />
          </div>
        )}
        
        {activeTool === 'crud' && (
          <div className="p-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Data Management</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Insert, update, delete, and manage your table data
              </p>
            </div>
            <ZeroCodeCRUDBuilder />
          </div>
        )}
        
        {activeTool === 'query' && (
          <div className="p-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Visual Query Builder</h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Build complex queries without writing SQL code
              </p>
            </div>
            <VisualQueryBuilder />
          </div>
        )}
        
        {activeTool === 'relationship' && (
          <div className="p-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Link className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Table Relationships</h3>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Define and manage relationships between your tables
              </p>
            </div>
            <RelationshipPanel />
          </div>
        )}
        
        {activeTool === 'security' && (
          <div className="p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Security Management</h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                Manage database users, roles, and permissions
              </p>
            </div>
            <SecurityManager />
          </div>
        )}
        
        {activeTool === 'team' && (
          <div className="p-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-200">Team Collaboration</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-300">
                    Real-time workspace collaboration and team management
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Real-time Sync</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Live collaboration active</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-3 h-3 text-indigo-600" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Team Members</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage workspace access</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-3 h-3 text-indigo-600" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Shared Schemas</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Collaborative database design</p>
                </div>
              </div>
            </div>
            <RealTimeCollaboration />
          </div>
        )}
        
        {!activeTool && (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Settings className="w-10 h-10 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Database Tools
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                Select a tool from the tabs above to start working with your database
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Export Section - Fixed at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-white">Export Schema</h4>
        </div>
        <ExportDropdown />
      </div>
    </div>
  );
};

export default ToolsPanel;