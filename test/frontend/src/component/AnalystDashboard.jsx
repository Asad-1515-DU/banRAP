import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AnalystDashboard.css';

const AnalystDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('labeling');
  const [currentUser, setCurrentUser] = useState(null);
  const [labeledRoads, setLabeledRoads] = useState([]);
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      roadId: 'RD-001',
      roadName: 'Main Street Segment',
      remark: 'Labels are inaccurate for lane width',
      date: '2025-01-10',
      status: 'pending',
    },
    {
      id: 2,
      roadId: 'RD-002',
      roadName: 'Dhaka Ring Road',
      remark: 'Missing hazard assessment',
      date: '2025-01-08',
      status: 'resolved',
    },
  ]);

  // Navigation state
  const [navigationData, setNavigationData] = useState({
    startLocation: '',
    endLocation: '',
    realTimeAlerts: false,
  });

  const [navigationStarted, setNavigationStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if user is logged in and is analyst
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'analyst') {
      navigate('/');
      return;
    }
    
    setCurrentUser(userData);
  }, [navigate]);

  // Handle image upload for feedback
  const handleNavigationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNavigationData({
      ...navigationData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Submit navigation
  const handleNavigationSubmit = async (e) => {
    e.preventDefault();

    if (!navigationData.startLocation.trim()) {
      setMessage({ type: 'error', text: 'Please enter start location' });
      return;
    }

    if (!navigationData.endLocation.trim()) {
      setMessage({ type: 'error', text: 'Please enter destination' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: `Navigation started from ${navigationData.startLocation} to ${navigationData.endLocation}.`,
        });
        setNavigationStarted(true);
        setLoading(false);

        // Reset after 2 seconds
        setTimeout(() => {
          setNavigationData({
            startLocation: '',
            endLocation: '',
            realTimeAlerts: false,
          });
          setNavigationStarted(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error starting navigation. Please try again.' });
      setLoading(false);
    }
  };

  const handleStartLabeling = () => {
    navigate('/road-labeling');
  };

  const handleResolveComplaint = (complaintId) => {
    setComplaints(complaints.map(c => 
      c.id === complaintId ? { ...c, status: 'resolved' } : c
    ));
  };

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="analyst-dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 Analyst Dashboard</h1>
          <p>Welcome, {currentUser.firstName}! Manage road labeling and complaints</p>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'navigation' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('navigation');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">🛣️</span>
            Safety Navigation
          </button>
          <button
            className={`tab-button ${activeTab === 'labeling' ? 'active' : ''}`}
            onClick={() => setActiveTab('labeling')}
          >
            <span className="tab-icon">🛣️</span>
            Road Labeling
          </button>
          <button
            className={`tab-button ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <span className="tab-icon">💬</span>
            Complaints & Remarks
          </button>
        </div>

        {message.text && (
          <div className={`dashboard-message ${message.type}-box`}>
            {message.text}
          </div>
        )}

        {/* Safety Aware Navigation Tab */}
        {activeTab === 'navigation' && (
          <div className="dashboard-card navigation-card">
            <div className="card-header">
              <h2>🛣️ Safety Aware Navigation</h2>
              <p>Plan a safe route with real-time alerts</p>
            </div>

            <form onSubmit={handleNavigationSubmit} className="navigation-form">
              {/* Start Location */}
              <div className="form-group">
                <label htmlFor="startLocation">Start Location</label>
                <input
                  type="text"
                  id="startLocation"
                  name="startLocation"
                  value={navigationData.startLocation}
                  onChange={handleNavigationChange}
                  placeholder="e.g., Dhaka International Airport"
                  className="form-input"
                />
              </div>

              {/* End Location */}
              <div className="form-group">
                <label htmlFor="endLocation">Destination</label>
                <input
                  type="text"
                  id="endLocation"
                  name="endLocation"
                  value={navigationData.endLocation}
                  onChange={handleNavigationChange}
                  placeholder="e.g., Shahbag, Dhaka"
                  className="form-input"
                />
              </div>

              {/* Real-time Alerts */}
              <div className="form-group checkbox-group">
                <label htmlFor="realTimeAlerts" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="realTimeAlerts"
                    name="realTimeAlerts"
                    checked={navigationData.realTimeAlerts}
                    onChange={handleNavigationChange}
                  />
                  <span>Enable Real-Time Safety Alerts</span>
                </label>
                <p className="help-text">
                  Get notified about hazards and safety incidents on your route
                </p>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start Navigation'}
              </button>
            </form>
          </div>
        )}

        {/* Road Labeling Tab */}
        {activeTab === 'labeling' && (
          <div className="tab-content labeling-content">
            <div className="labeling-header">
              <h2>Road Labeling Management</h2>
              <p>Select and label road segments with detailed information</p>
            </div>

            <div className="labeling-grid">
              {/* Start Labeling Card */}
              <div className="labeling-card">
                <div className="card-icon">🛣️</div>
                <h3>Start New Labeling</h3>
                <p>Begin labeling a new road segment with 3D and 2D maps</p>
                <button className="action-button" onClick={handleStartLabeling}>
                  Start Labeling
                </button>
              </div>

              {/* Recent Labels Card */}
              <div className="labeling-card">
                <div className="card-icon">📋</div>
                <h3>Recent Labeled Roads</h3>
                <p>{labeledRoads.length} roads labeled this month</p>
                <div className="recent-list">
                  {labeledRoads.length === 0 ? (
                    <p className="empty-message">No labeled roads yet</p>
                  ) : (
                    labeledRoads.map((road) => (
                      <div key={road.id} className="recent-item">
                        <span>{road.name}</span>
                        <span className="date">{road.date}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Statistics Card */}
              <div className="labeling-card">
                <div className="card-icon">📊</div>
                <h3>Labeling Statistics</h3>
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Roads</span>
                    <span className="stat-value">{labeledRoads.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pending Review</span>
                    <span className="stat-value">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value">{labeledRoads.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="tab-content complaints-content">
            <div className="complaints-header">
              <h2>Complaints & Remarks</h2>
              <p>Review feedback and remarks about your labeling work</p>
            </div>

            <div className="complaints-list">
              {complaints.length === 0 ? (
                <div className="empty-state">
                  <p>✓ No complaints. Great job!</p>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className={`complaint-card ${complaint.status}`}
                  >
                    <div className="complaint-header">
                      <h3>{complaint.roadName}</h3>
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status === 'pending' ? '⏳ Pending' : '✓ Resolved'}
                      </span>
                    </div>
                    <div className="complaint-body">
                      <p className="complaint-text">
                        <strong>Remark:</strong> {complaint.remark}
                      </p>
                      <div className="complaint-meta">
                        <span className="road-id">ID: {complaint.roadId}</span>
                        <span className="complaint-date">📅 {complaint.date}</span>
                      </div>
                    </div>
                    {complaint.status === 'pending' && (
                      <button
                        className="resolve-button"
                        onClick={() => handleResolveComplaint(complaint.id)}
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalystDashboard;
