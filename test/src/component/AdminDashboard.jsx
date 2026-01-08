import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('navigation');
  const [loading, setLoading] = useState(false);

  // Navigation State
  const [navigationData, setNavigationData] = useState({
    startLocation: '',
    destination: '',
    alerts: []
  });

  // Labeling Review State
  const [labelingSubmissions, setLabelingSubmissions] = useState([
    {
      id: 1,
      analystName: 'Ahmed Hassan',
      analystEmail: 'analyst@bdrap.com',
      roadName: 'Dhaka-Chittagong Highway',
      segmentId: 'SEG-001-100m',
      submittedDate: '2025-11-18',
      status: 'pending',
      comment: '',
      reviewComment: ''
    },
    {
      id: 2,
      analystName: 'Fatima Khan',
      analystEmail: 'analyst2@bdrap.com',
      roadName: 'Mirpur Main Road',
      segmentId: 'SEG-002-100m',
      submittedDate: '2025-11-17',
      status: 'pending',
      comment: '',
      reviewComment: ''
    }
  ]);

  // Analyst Management State
  const [analystList, setAnalystList] = useState([
    {
      id: 1,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'analyst@bdrap.com',
      status: 'active',
      joiningDate: '2025-01-15',
      totalLabelings: 45,
      suspensionReason: ''
    },
    {
      id: 2,
      firstName: 'Fatima',
      lastName: 'Khan',
      email: 'analyst2@bdrap.com',
      status: 'active',
      joiningDate: '2025-02-20',
      totalLabelings: 32,
      suspensionReason: ''
    }
  ]);

  const [showAddAnalyst, setShowAddAnalyst] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [newAnalyst, setNewAnalyst] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [suspensionData, setSuspensionData] = useState({
    analystId: null,
    reason: '',
    showForm: false
  });

  const [reviewData, setReviewData] = useState({
    submissionId: null,
    action: '',
    comment: '',
    showForm: false
  });

  // Check user role on mount
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== 'admin') {
          navigate('/');
        }
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user:', e);
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Navigation Handlers
  const handleNavigationChange = (e) => {
    const { name, value } = e.target;
    setNavigationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNavigationSubmit = (e) => {
    e.preventDefault();
    if (!navigationData.startLocation.trim() || !navigationData.destination.trim()) {
      alert('Please fill in all navigation fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setNavigationData(prev => ({
        ...prev,
        alerts: [
          {
            type: 'info',
            message: `Calculating safest route from ${navigationData.startLocation} to ${navigationData.destination}...`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      }));
      setLoading(false);
    }, 1500);
  };

  // Labeling Review Handlers
  const handleReviewSubmit = (submissionId, action, comment) => {
    if (action === 'reject' && !comment.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLabelingSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId
          ? {
            ...sub,
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewComment: comment
          }
          : sub
      )
    );

    // Notify analyst (in real app, send notification/email)
    const submission = labelingSubmissions.find(s => s.id === submissionId);
    console.log(`Notification sent to ${submission.analystEmail}: Labeling ${action}ed. Comment: ${comment}`);

    setReviewData({
      submissionId: null,
      action: '',
      comment: '',
      showForm: false
    });
  };

  // Analyst Management Handlers
  const handleAddAnalyst = (e) => {
    e.preventDefault();
    if (!newAnalyst.firstName.trim() || !newAnalyst.lastName.trim() || 
        !newAnalyst.email.trim() || !newAnalyst.password.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const analyst = {
      id: analystList.length + 1,
      firstName: newAnalyst.firstName,
      lastName: newAnalyst.lastName,
      email: newAnalyst.email,
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      totalLabelings: 0,
      suspensionReason: ''
    };

    setAnalystList(prev => [...prev, analyst]);
    setNewAnalyst({ firstName: '', lastName: '', email: '', password: '' });
    setShowAddAnalyst(false);

    // In real app, send notification to new analyst
    console.log(`New analyst added: ${analyst.email}`);
  };

  const handleSuspendAnalyst = (analystId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    setAnalystList(prev =>
      prev.map(analyst =>
        analyst.id === analystId
          ? { ...analyst, status: 'suspended', suspensionReason: reason }
          : analyst
      )
    );

    const analyst = analystList.find(a => a.id === analystId);
    console.log(`Notification sent to ${analyst.email}: Account suspended. Reason: ${reason}`);

    setSuspensionData({
      analystId: null,
      reason: '',
      showForm: false
    });
  };

  const handleRemoveSuspension = (analystId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for removal');
      return;
    }

    setAnalystList(prev =>
      prev.map(analyst =>
        analyst.id === analystId
          ? { ...analyst, status: 'active', suspensionReason: '' }
          : analyst
      )
    );

    const analyst = analystList.find(a => a.id === analystId);
    console.log(`Notification sent to ${analyst.email}: Suspension removed. Reason: ${reason}`);

    setSuspensionData({
      analystId: null,
      reason: '',
      showForm: false
    });
  };

  if (!currentUser) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>👨‍💼 Administrator Dashboard</h1>
        <p>Welcome, {currentUser.firstName} {currentUser.lastName}</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'navigation' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigation')}
        >
          🧭 Safety Navigation
        </button>
        <button
          className={`tab-btn ${activeTab === 'labeling' ? 'active' : ''}`}
          onClick={() => setActiveTab('labeling')}
        >
          📋 Labeling Review
        </button>
        <button
          className={`tab-btn ${activeTab === 'analysts' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysts')}
        >
          👥 Analyst Management
        </button>
      </div>

      {/* Navigation Tab */}
      {activeTab === 'navigation' && (
        <section className="admin-section">
          <div className="section-card">
            <h2>🧭 Safety-Aware Navigation</h2>
            <form onSubmit={handleNavigationSubmit} className="nav-form">
              <div className="form-group">
                <label>Start Location</label>
                <input
                  type="text"
                  name="startLocation"
                  value={navigationData.startLocation}
                  onChange={handleNavigationChange}
                  placeholder="Enter starting location"
                />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={navigationData.destination}
                  onChange={handleNavigationChange}
                  placeholder="Enter destination"
                />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Calculating...' : 'Start Navigation'}
              </button>
            </form>

            {navigationData.alerts.length > 0 && (
              <div className="alerts-container">
                {navigationData.alerts.map((alert, idx) => (
                  <div key={idx} className={`alert alert-${alert.type}`}>
                    {alert.message}
                    <span className="alert-time">{alert.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Labeling Review Tab */}
      {activeTab === 'labeling' && (
        <section className="admin-section">
          <div className="section-card">
            <h2>📋 Labeling Submissions for Review</h2>
            <div className="submissions-list">
              {labelingSubmissions.map(submission => (
                <div key={submission.id} className={`submission-item status-${submission.status}`}>
                  <div className="submission-header">
                    <div className="submission-info">
                      <h3>{submission.roadName}</h3>
                      <p className="analyst-info">By: {submission.analystName} ({submission.analystEmail})</p>
                      <p className="segment-info">Segment: {submission.segmentId}</p>
                      <p className="date-info">Submitted: {submission.submittedDate}</p>
                    </div>
                    <div className={`status-badge status-${submission.status}`}>
                      {submission.status.toUpperCase()}
                    </div>
                  </div>

                  {submission.status === 'pending' && (
                    <div className="submission-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleReviewSubmit(submission.id, 'approve', '')}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => setReviewData({
                          submissionId: submission.id,
                          action: 'reject',
                          comment: '',
                          showForm: true
                        })}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {submission.reviewComment && (
                    <div className="review-comment">
                      <strong>Review Comment:</strong> {submission.reviewComment}
                    </div>
                  )}

                  {reviewData.showForm && reviewData.submissionId === submission.id && (
                    <div className="review-form">
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({
                          ...prev,
                          comment: e.target.value
                        }))}
                        placeholder="Enter rejection reason..."
                        rows="3"
                      />
                      <div className="form-buttons">
                        <button
                          className="btn-confirm"
                          onClick={() => handleReviewSubmit(
                            submission.id,
                            reviewData.action,
                            reviewData.comment
                          )}
                        >
                          Confirm Rejection
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setReviewData({
                            submissionId: null,
                            action: '',
                            comment: '',
                            showForm: false
                          })}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Analyst Management Tab */}
      {activeTab === 'analysts' && (
        <section className="admin-section">
          <div className="section-card">
            <div className="analysts-header">
              <h2>👥 Analyst Management</h2>
              <button
                className="btn-add-analyst"
                onClick={() => setShowAddAnalyst(!showAddAnalyst)}
              >
                + Add New Analyst
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="🔍 Search analyst by email..."
                className="search-input"
              />
              {searchEmail && (
                <button
                  className="search-clear"
                  onClick={() => setSearchEmail('')}
                >
                  ✕
                </button>
              )}
            </div>

            {showAddAnalyst && (
              <form onSubmit={handleAddAnalyst} className="add-analyst-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={newAnalyst.firstName}
                      onChange={(e) => setNewAnalyst(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={newAnalyst.lastName}
                      onChange={(e) => setNewAnalyst(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newAnalyst.email}
                      onChange={(e) => setNewAnalyst(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newAnalyst.password}
                      onChange={(e) => setNewAnalyst(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-submit">Create Analyst Account</button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowAddAnalyst(false);
                      setNewAnalyst({ firstName: '', lastName: '', email: '', password: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="analysts-list">
              {analystList
                .filter(analyst =>
                  analyst.email.toLowerCase().includes(searchEmail.toLowerCase())
                )
                .map(analyst => (
                <div key={analyst.id} className={`analyst-card status-${analyst.status}`}>
                  <div className="analyst-header">
                    <div className="analyst-info">
                      <h3>{analyst.firstName} {analyst.lastName}</h3>
                      <p className="email">{analyst.email}</p>
                      <p className="joining-date">Joined: {analyst.joiningDate}</p>
                      <p className="labelings">Total Labelings: {analyst.totalLabelings}</p>
                    </div>
                    <div className={`status-badge analyst-status-${analyst.status}`}>
                      {analyst.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="analyst-actions">
                    {analyst.status === 'active' && (
                      <button
                        className="btn-suspend"
                        onClick={() => setSuspensionData({
                          analystId: analyst.id,
                          reason: '',
                          showForm: true
                        })}
                      >
                        ⚠️ Suspend
                      </button>
                    )}
                    {analyst.status === 'suspended' && (
                      <button
                        className="btn-unsuspend"
                        onClick={() => setSuspensionData({
                          analystId: analyst.id,
                          reason: '',
                          showForm: true
                        })}
                      >
                        ✓ Remove Suspension
                      </button>
                    )}
                  </div>

                  {analyst.suspensionReason && (
                    <div className="suspension-info">
                      <strong>Suspension Reason:</strong> {analyst.suspensionReason}
                    </div>
                  )}

                  {suspensionData.showForm && suspensionData.analystId === analyst.id && (
                    <div className="suspension-form">
                      <textarea
                        value={suspensionData.reason}
                        onChange={(e) => setSuspensionData(prev => ({
                          ...prev,
                          reason: e.target.value
                        }))}
                        placeholder={`Enter ${analyst.status === 'active' ? 'suspension' : 'removal'} reason...`}
                        rows="3"
                      />
                      <div className="form-buttons">
                        <button
                          className="btn-confirm"
                          onClick={() => {
                            if (analyst.status === 'active') {
                              handleSuspendAnalyst(analyst.id, suspensionData.reason);
                            } else {
                              handleRemoveSuspension(analyst.id, suspensionData.reason);
                            }
                          }}
                        >
                          {analyst.status === 'active' ? 'Suspend Analyst' : 'Remove Suspension'}
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setSuspensionData({
                            analystId: null,
                            reason: '',
                            showForm: false
                          })}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
