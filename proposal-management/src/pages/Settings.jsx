import { User, Shield, Bell, Palette } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  return (
    <div className="settings-page container animate-fade-in" id="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and application settings.</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <button className="settings-tab active"><User size={16} /> Profile</button>
          <button className="settings-tab"><Shield size={16} /> Security</button>
          <button className="settings-tab"><Bell size={16} /> Notifications</button>
          <button className="settings-tab"><Palette size={16} /> Appearance</button>
        </div>

        <div className="settings-panel card">
          <h3>Profile Information</h3>
          <p className="settings-desc">Update your account details here.</p>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className="form-input" value="admin" disabled />
            <p className="form-help">Your username is locked by the system.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" defaultValue="admin@topcoder.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Company / Team</label>
            <input type="text" className="form-input" defaultValue="Topcoder" />
          </div>

          <button className="btn btn-primary mt-4">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
