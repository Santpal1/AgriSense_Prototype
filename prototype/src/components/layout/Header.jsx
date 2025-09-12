import React from "react";
import { 
  Calendar, 
  Search, 
  Filter, 
  Bell 
} from "lucide-react";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="page-title">Farm Dashboard</h2>
          <div className="last-updated">
            <Calendar className="icon-small" />
            <span>Last updated: 5 minutes ago</span>
          </div>
        </div>

        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search fields..."
              className="search-input"
            />
          </div>
          <button className="header-btn">
            <Filter className="icon" />
          </button>
          <button className="header-btn notification-btn">
            <Bell className="icon" />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;