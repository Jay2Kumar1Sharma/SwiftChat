import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { GroupList } from './GroupList';
import { UserList } from './UserList';

interface SidebarProps {
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username || 'User'}</span>
            {isDemoMode && <span className="demo-badge">Demo</span>}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Menu"
          >
            ⋮
          </button>
          {showUserMenu && (
            <div className="user-menu">
              <button onClick={() => setActiveTab('groups')}>Groups</button>
              <button onClick={() => setActiveTab('users')}>Users</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <span className="tab-icon">👥</span>
          Groups
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span className="tab-icon">👤</span>
          Users
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'groups' ? (
          <GroupList />
        ) : (
          <UserList />
        )}
      </div>
    </div>
  );
};
