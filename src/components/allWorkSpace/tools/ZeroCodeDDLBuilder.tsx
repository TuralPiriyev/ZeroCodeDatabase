import React, { useState } from 'react';
import { Plus, Database, Edit3, Trash2, Table, Columns, Key } from 'lucide-react';
import { useDatabase } from '../../../context/DatabaseContext';
import TableBuilder from './TableBuilder';
import EnhancedTableBuilder from './EnhancedTableBuilder';

const ZeroCodeDDLBuilder: React.FC = () => {
  const { currentSchema } = useDatabase();
  const [activeSection, setActiveSection] = useState<'create' | 'manage'>('create');

  const ddlOperations = [
    {
      id: 'create',
      title: 'Create Table',
      description: 'Add a new table with columns',
      icon: Plus,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'alter',
      title: 'Alter Table',
      description: 'Modify existing table structure',
      icon: Edit3,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'drop',
      title: 'Drop Table',
      description: 'Remove table and all data',
      icon: Trash2,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* DDL Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ddlOperations.map((operation) => {
          const Icon = operation.icon;
          return (
            <div
              key={operation.id}
              className={`
                ${operation.bgColor} ${operation.borderColor} border-2 rounded-xl p-4 
                hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${operation.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${operation.color}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${operation.color}`}>{operation.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{operation.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Builder Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Table className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Table Builder</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create and configure database tables</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSection('create')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setActiveSection('manage')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'manage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {activeSection === 'create' ? <TableBuilder /> : <EnhancedTableBuilder />}
        </div>
      </div>

      {/* Existing Tables Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Columns className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Existing Tables ({currentSchema.tables.length})</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your database structure</p>
          </div>
        </div>

        {currentSchema.tables.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No tables created yet</p>
            <p className="text-sm text-gray-400">Create your first table to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentSchema.tables.map((table) => (
              <div
                key={table.id}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-white truncate">{table.name}</h5>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{table.columns.length} columns</span>
                      <span>{table.rowCount} rows</span>
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        {table.columns.filter(col => col.isPrimaryKey).length} PK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZeroCodeDDLBuilder;