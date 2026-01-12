import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TravelerDashboard.css';

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState('feedback');
  const [feedbackData, setFeedbackData] = useState({
    location: '',
    rating: 5,
    comment: '',
    image: null,
    imagePreview: null,
  });
  const [navigationData, setNavigationData] = useState({
    startLocation: '',
    endLocation: '',
    realTimeAlerts: false,
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if user is logged in
  React.useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  // Handle image upload for feedback
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackData({
          ...feedbackData,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle feedback form changes
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({
      ...feedbackData,
      [name]: value,
    });
  };

  // Handle navigation form changes
  const handleNavigationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNavigationData({
      ...navigationData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Submit feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackData.location.trim()) {
      setMessage({ type: 'error', text: 'Please enter a location' });
      return;
    }
    
    if (!feedbackData.comment.trim()) {
      setMessage({ type: 'error', text: 'Please enter a comment' });
      return;
    }

    if (!feedbackData.image) {
      setMessage({ type: 'error', text: 'Please upload an image' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: 'success',
        text: 'Feedback submitted successfully! Thank you for your feedback.',
      });
      setFeedbackSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFeedbackData({
          location: '',
          rating: 5,
          comment: '',
          image: null,
          imagePreview: null,
        });
        setFeedbackSubmitted(false);
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting feedback. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Start safety navigation
  const handleNavigationSubmit = (e) => {
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

  return (
    <div className="traveler-dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Traveler Dashboard</h1>
          <p>Welcome back! Manage your travel feedback and navigation preferences</p>
        </div>

        {message.text && (
          <div className={`dashboard-message ${message.type}-box`}>
            {message.text}
          </div>
        )}

        {/* Card Selection Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeCard === 'feedback' ? 'active' : ''}`}
            onClick={() => {
              setActiveCard('feedback');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">📸</span>
            Feedback
          </button>
          <button
            className={`tab-button ${activeCard === 'navigation' ? 'active' : ''}`}
            onClick={() => {
              setActiveCard('navigation');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">🛣️</span>
            Safety Aware Navigation
          </button>
        </div>

        {/* Feedback Card */}
        {activeCard === 'feedback' && (
          <div className="dashboard-card feedback-card">
            <div className="card-header">
              <h2>📸 Travel Feedback</h2>
              <p>Share your travel experience with photos and ratings</p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
              {/* Image Upload */}
              <div className="form-group">
                <label htmlFor="image">Upload Image</label>
                <div className="image-upload-container">
                  {feedbackData.imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img
                        src={feedbackData.imagePreview}
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          setFeedbackData({
                            ...feedbackData,
                            image: null,
                            imagePreview: null,
                          })
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="image" className="upload-label">
                      <div className="upload-icon">📷</div>
                      <p>Click to upload image</p>
                      <span>PNG, JPG, GIF up to 5MB</span>
                    </label>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={feedbackData.location}
                  onChange={handleFeedbackChange}
                  placeholder="Enter the location of your feedback"
                  className="form-input"
                />
              </div>

              {/* Rating */}
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <div className="rating-container">
                  <select
                    id="rating"
                    name="rating"
                    value={feedbackData.rating}
                    onChange={handleFeedbackChange}
                    className="form-select"
                  >
                    <option value={1}>⭐ 1 - Poor</option>
                    <option value={2}>⭐⭐ 2 - Fair</option>
                    <option value={3}>⭐⭐⭐ 3 - Good</option>
                    <option value={4}>⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  </select>
                  <span className="rating-display">
                    {'⭐'.repeat(feedbackData.rating)}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="form-group">
                <label htmlFor="comment">Your Comment</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={feedbackData.comment}
                  onChange={handleFeedbackChange}
                  placeholder="Share your thoughts and experiences..."
                  className="form-textarea"
                  rows={5}
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading || feedbackSubmitted}
              >
                {loading ? 'Submitting...' : feedbackSubmitted ? '✓ Submitted' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        )}

        {/* Safety Aware Navigation Card */}
        {activeCard === 'navigation' && (
          <div className="dashboard-card navigation-card">
            <div className="card-header">
              <h2>🛣️ Safety Aware Navigation</h2>
              <p>Plan your route with safety preferences and real-time alerts</p>
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
                  placeholder="Enter starting point"
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
                  placeholder="Enter destination"
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
                    className="checkbox-input"
                  />
                  <span>Enable Real-time Safety Alerts</span>
                </label>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading || navigationStarted}
              >
                {loading ? 'Starting...' : navigationStarted ? '✓ Started' : 'Start Navigation'}
              </button>
            </form>

            {/* Safety Tips */}
            <div className="safety-tips">
              <h3>Safety Tips</h3>
              <ul>
                <li>✓ Always share your route with a trusted contact</li>
                <li>✓ Enable real-time alerts for immediate notifications</li>
                <li>✓ Keep your phone charged during travel</li>
                <li>✓ Avoid isolated routes during late hours</li>
                <li>✓ Report unsafe areas to help other travelers</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelerDashboard;
