import React, { useState, useEffect } from 'react';
import { Users, Crown, Edit, Eye, Trash2, RefreshCw, Calendar } from 'lucide-react';

interface TeamMember {
  username: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string | Date;
}

interface TeamMembersListProps {
  workspaceId: string;
  members: TeamMember[];
  onMembersUpdate: (members: TeamMember[]) => void;
  currentUserRole?: string;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  workspaceId, 
  members, 
  onMembersUpdate,
  currentUserRole = 'owner'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fix joinedAt date conversion bug
  const normalizedMembers = members.map(member => ({
    ...member,
    joinedAt: member.joinedAt instanceof Date 
      ? member.joinedAt 
      : new Date(member.joinedAt)
  }));

  const refreshMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }

      onMembersUpdate(data.members);
    } catch (error) {
      console.error('Error refreshing members:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh members');
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (username: string) => {
    if (!window.confirm(`Are you sure you want to remove ${username} from this workspace?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member');
      }

      onMembersUpdate(data.members);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'editor':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'viewer':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  const generateUserColor = (username: string): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Members ({normalizedMembers.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage workspace access and permissions
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshMembers}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
          title="Refresh members list"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200 text-sm font-medium">Error</span>
          </div>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {normalizedMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No team members yet</p>
            <p className="text-sm text-gray-400">Invite users to start collaborating</p>
          </div>
        ) : (
          normalizedMembers.map((member, index) => {
            const isOwner = member.role === 'owner';
            const canRemove = currentUserRole === 'owner' && !isOwner;
            const userColor = generateUserColor(member.username);
            
            return (
              <div
                key={`${member.username}-${index}`}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
                  ${isOwner 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md'
                  }
                `}
              >
                {/* User Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: userColor }}
                >
                  {member.username.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {member.username}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="capitalize">{member.role}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Joined {member.joinedAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {canRemove && (
                    <button
                      onClick={() => removeMember(member.username)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      title={`Remove ${member.username} from workspace`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Team Statistics */}
      {normalizedMembers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {normalizedMembers.filter(m => m.role === 'owner').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Owners</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {normalizedMembers.filter(m => m.role === 'editor').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Editors</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {normalizedMembers.filter(m => m.role === 'viewer').length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Viewers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersList;