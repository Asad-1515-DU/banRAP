import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoadLabeling.css';

// Road labeling categories with icons
const LABEL_CATEGORIES = [
  {
    name: 'Roadside',
    icon: '🛣️',
    items: [
      { id: 'building', label: 'Building', icon: '🏢' },
      { id: 'tree', label: 'Tree', icon: '🌳' },
      { id: 'pole', label: 'Pole', icon: '🔌' },
      { id: 'wall', label: 'Wall', icon: '🧱' },
      { id: 'water', label: 'Water', icon: '💧' },
      { id: 'rock', label: 'Rock', icon: '🪨' },
    ],
  },
  {
    name: 'Mid-block',
    icon: '📍',
    items: [
      { id: 'junction', label: 'Junction', icon: '⛔' },
      { id: 'crossing', label: 'Crossing', icon: '🚷' },
      { id: 'bus-stop', label: 'Bus Stop', icon: '🚌' },
      { id: 'traffic-light', label: 'Traffic Light', icon: '🚦' },
    ],
  },
  {
    name: 'Intersections',
    icon: '🤝',
    items: [
      { id: 'signal', label: 'Signal', icon: '🚦' },
      { id: 'roundabout', label: 'Roundabout', icon: '⭕' },
      { id: 'stop-sign', label: 'Stop Sign', icon: '🛑' },
      { id: 'uncontrolled', label: 'Uncontrolled', icon: '❌' },
    ],
  },
  {
    name: 'Flow',
    icon: '➡️',
    items: [
      { id: 'one-way', label: 'One Way', icon: '→' },
      { id: 'two-way', label: 'Two Way', icon: '↔️' },
      { id: 'parking', label: 'Parking', icon: '🅿️' },
      { id: 'bike-lane', label: 'Bike Lane', icon: '🚲' },
    ],
  },
  {
    name: 'VRU facilities and land use',
    icon: '👥',
    items: [
      { id: 'sidewalk', label: 'Sidewalk', icon: '🚶' },
      { id: 'footpath', label: 'Footpath', icon: '👣' },
      { id: 'median', label: 'Median', icon: '🟫' },
      { id: 'park', label: 'Park', icon: '🌲' },
    ],
  },
  {
    name: 'Speeds',
    icon: '⚡',
    items: [
      { id: 'speed-20', label: '20km/h', icon: '2️⃣0️⃣' },
      { id: 'speed-40', label: '40km/h', icon: '4️⃣0️⃣' },
      { id: 'speed-60', label: '60km/h', icon: '6️⃣0️⃣' },
      { id: 'speed-80', label: '80km/h', icon: '8️⃣0️⃣' },
    ],
  },
  {
    name: 'Extras',
    icon: '✨',
    items: [
      { id: 'lighting', label: 'Lighting', icon: '💡' },
      { id: 'drainage', label: 'Drainage', icon: '💧' },
      { id: 'hazard', label: 'Hazard', icon: '⚠️' },
      { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    ],
  },
];

// Distance options
const DISTANCE_OPTIONS = ['0-1', '1-5', '5-10', '10+'];

// Road object types
const LEFT_OBJECTS = ['METAL', 'CONCRETE', 'BUS', 'TRUCK', 'RESIDUAL'];
const RIGHT_OBJECTS = ['METAL', 'CONCRETE', 'BUS', 'TRUCK', 'RESIDUAL'];

// Shoulder rumble strips
const SHOULDER_RUMBLE = ['EDGELINE', 'REGULAR RUMBLE'];

// Paved shoulder width
const PAVED_SHOULDER = ['NONE', '0-1', '1-2', '2-4'];

const RoadLabeling = () => {
  const navigate = useNavigate();
  const [roadInfo, setRoadInfo] = useState({
    roadName: '',
    roadId: '',
    location: '',
    segmentLength: '',
  });

  const [labels, setLabels] = useState({});
  const [selectedTab, setSelectedTab] = useState('Roadside');
  const [currentStep, setCurrentStep] = useState('info');
  const [segmentNumber, setSegmentNumber] = useState(1);
  const [totalSegments, setTotalSegments] = useState(1);

  const handleRoadInfoChange = (e) => {
    const { name, value } = e.target;
    setRoadInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLabelClick = (itemId) => {
    const key = `${selectedTab}-${itemId}`;
    setLabels(prev => ({
      ...prev,
      [key]: !prev[key], // Toggle selection
    }));
  };

  const handleDistanceSelect = (distance, side) => {
    setLabels(prev => ({
      ...prev,
      [`${side}-distance`]: distance,
    }));
  };

  const handleShoulderSelect = (type, side) => {
    setLabels(prev => ({
      ...prev,
      [`${side}-shoulder`]: type,
    }));
  };

  const handleStartLabeling = () => {
    if (!roadInfo.roadName || !roadInfo.roadId) {
      alert('Please fill in Road Name and Road ID');
      return;
    }
    setCurrentStep('labeling');
  };

  const handleNextSegment = () => {
    if (segmentNumber < totalSegments) {
      setSegmentNumber(segmentNumber + 1);
      setLabels({});
    }
  };

  const handlePrevSegment = () => {
    if (segmentNumber > 1) {
      setSegmentNumber(segmentNumber - 1);
    }
  };

  const handleSaveAndExit = () => {
    alert(`✓ Labels saved for segment ${segmentNumber}!`);
    navigate('/analyst-dashboard');
  };

  if (currentStep === 'info') {
    return (
      <div className="road-labeling-container">
        <div className="labeling-header-bar">
          <div className="header-left">
            <h1>🛣️ Road Labeling System</h1>
          </div>
          <button className="back-button" onClick={() => navigate('/analyst-dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="road-info-section">
          <div className="section-card">
            <h2>📍 Road Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Road Name *</label>
                <input
                  type="text"
                  name="roadName"
                  value={roadInfo.roadName}
                  onChange={handleRoadInfoChange}
                  placeholder="e.g., Dhaka Ring Road"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Road ID *</label>
                <input
                  type="text"
                  name="roadId"
                  value={roadInfo.roadId}
                  onChange={handleRoadInfoChange}
                  placeholder="e.g., RD-001"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={roadInfo.location}
                  onChange={handleRoadInfoChange}
                  placeholder="e.g., Dhaka, Bangladesh"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Number of Segments</label>
                <input
                  type="number"
                  value={totalSegments}
                  onChange={(e) => setTotalSegments(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="e.g., 5"
                  className="form-input"
                  min="1"
                />
              </div>
            </div>

            <button className="start-button" onClick={handleStartLabeling}>
              Continue to Labeling →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="road-labeling-container">
      <div className="labeling-header-bar">
        <div className="header-left">
          <h1>�️ {roadInfo.roadName}</h1>
          <span className="segment-counter">Segment {segmentNumber} of {totalSegments}</span>
        </div>
        <button className="save-exit-button" onClick={handleSaveAndExit}>
          Save & Exit
        </button>
      </div>

      <div className="labeling-interface">
        {/* Top Section - Street View / Map Placeholder */}
        <div className="street-view-section">
          <div className="street-view-placeholder">
            <div className="placeholder-icon">📸</div>
            <p>Street View / 360° Map Integration Area</p>
            <p className="placeholder-note">Ready for Google Street View or Mapbox integration</p>
          </div>

          {/* Segment Navigation */}
          <div className="segment-navigation">
            <button className="nav-button" onClick={handlePrevSegment} disabled={segmentNumber === 1}>
              ← Previous
            </button>
            <span className="segment-display">{segmentNumber} / {totalSegments}</span>
            <button className="nav-button" onClick={handleNextSegment} disabled={segmentNumber === totalSegments}>
              Next →
            </button>
          </div>
        </div>

        {/* Main Labeling Panel */}
        <div className="labeling-panel">
          {/* Top Tab Bar - Categories */}
          <div className="category-tabs">
            {LABEL_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className={`category-tab ${selectedTab === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedTab(cat.name)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Labeling Grid */}
          <div className="labeling-content">
            {/* Left Side - Left Object */}
            <div className="label-section left-section">
              <h3>Left object</h3>
              <div className="object-grid">
                {LEFT_OBJECTS.map(obj => (
                  <div
                    key={`left-${obj}`}
                    className={`object-item ${labels[`left-${obj}`] ? 'selected' : ''}`}
                    onClick={() => handleLabelClick(`left-${obj}`)}
                  >
                    {obj}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Top - Distance to Objects */}
            <div className="label-section center-top-section">
              <div className="distance-panel">
                <div>
                  <h4>Left distance to object</h4>
                  <div className="distance-options">
                    {DISTANCE_OPTIONS.map(dist => (
                      <button
                        key={`left-dist-${dist}`}
                        className={`distance-btn ${labels['left-distance'] === dist ? 'active' : ''}`}
                        onClick={() => handleDistanceSelect(dist, 'left')}
                      >
                        {dist}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Right distance to object</h4>
                  <div className="distance-options">
                    {DISTANCE_OPTIONS.map(dist => (
                      <button
                        key={`right-dist-${dist}`}
                        className={`distance-btn ${labels['right-distance'] === dist ? 'active' : ''}`}
                        onClick={() => handleDistanceSelect(dist, 'right')}
                      >
                        {dist}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Right Object */}
            <div className="label-section right-section">
              <h3>Right object</h3>
              <div className="object-grid">
                {RIGHT_OBJECTS.map(obj => (
                  <div
                    key={`right-${obj}`}
                    className={`object-item ${labels[`right-${obj}`] ? 'selected' : ''}`}
                    onClick={() => handleLabelClick(`right-${obj}`)}
                  >
                    {obj}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom - Shoulder Details */}
            <div className="label-section shoulder-section">
              <div className="shoulder-panel">
                <div>
                  <h4>Left paved shoulder</h4>
                  <div className="shoulder-options">
                    {PAVED_SHOULDER.map(width => (
                      <button
                        key={`left-shoulder-${width}`}
                        className={`shoulder-btn ${labels[`left-shoulder-width`] === width ? 'active' : ''}`}
                        onClick={() => handleShoulderSelect(width, 'left-shoulder')}
                      >
                        {width}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Right paved shoulder</h4>
                  <div className="shoulder-options">
                    {PAVED_SHOULDER.map(width => (
                      <button
                        key={`right-shoulder-${width}`}
                        className={`shoulder-btn ${labels[`right-shoulder-width`] === width ? 'active' : ''}`}
                        onClick={() => handleShoulderSelect(width, 'right-shoulder')}
                      >
                        {width}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Icon-based Category Items */}
            <div className="label-section icon-items-section">
              <h3>{selectedTab}</h3>
              <div className="icon-grid">
                {LABEL_CATEGORIES.find(c => c.name === selectedTab)?.items.map(item => (
                  <button
                    key={item.id}
                    className={`icon-item ${labels[`${selectedTab}-${item.id}`] ? 'selected' : ''}`}
                    onClick={() => handleLabelClick(item.id)}
                    title={item.label}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="labeling-actions">
            <button className="action-btn code-tab">Code Tab To Current 100m</button>
            <button className="action-btn code-all">Code Tab To All Layout Segments</button>
            <button className="action-btn close-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadLabeling;
