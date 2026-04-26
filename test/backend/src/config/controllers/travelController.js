import prisma from '../config/prisma.js';
import { validateCoordinate, sanitizeCoordinate } from '../utils/coordinateValidation.js';

export const getTravellerDashboard = async (req, res) => {
  try {
    const { email } = req.user;

    const traveller = await prisma.traveller.findUnique({
      where: { email },
      include: {
        user: {
          select: { name: true, phone: true, email: true }
        }
      }
    });

    if (!traveller) {
      return res.status(404).json({
        success: false,
        message: 'Traveller not found'
      });
    }

    // Get recent roads/segments for the traveller
    const recentFeedbacks = await prisma.feedback.findMany({
      where: { email },
      include: {
        road: true,
        segment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Parse coordinates in feedbacks
    const formattedFeedbacks = recentFeedbacks.map(feedback => {
      let roadStartCoord = null;
      let roadEndCoord = null;
      let segmentStartCoord = null;
      let segmentEndCoord = null;

      try {
        if (feedback.road) {
          roadStartCoord = feedback.road.rStartCoord ? JSON.parse(feedback.road.rStartCoord) : null;
          roadEndCoord = feedback.road.rEndCoord ? JSON.parse(feedback.road.rEndCoord) : null;
        }
        if (feedback.segment) {
          segmentStartCoord = feedback.segment.sStartCoord ? JSON.parse(feedback.segment.sStartCoord) : null;
          segmentEndCoord = feedback.segment.sEndCoord ? JSON.parse(feedback.segment.sEndCoord) : null;
        }
      } catch (e) {
        console.warn(`Failed to parse coordinates for feedback ${feedback.feedbackID}:`, e);
      }

      return {
        ...feedback,
        road: feedback.road ? {
          ...feedback.road,
          rStartCoord: roadStartCoord,
          rEndCoord: roadEndCoord
        } : null,
        segment: feedback.segment ? {
          ...feedback.segment,
          sStartCoord: segmentStartCoord,
          sEndCoord: segmentEndCoord
        } : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        traveller,
        recentFeedbacks: formattedFeedbacks
      }
    });
  } catch (error) {
    console.error('Get traveller dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
};

export const getTravellerMap = async (req, res) => {
  try {
    // Get all roads and segments
    const roads = await prisma.road.findMany({
      include: {
        segments: {
          include: {
            starRatings: true
          }
        }
      }
    });

    // Parse coordinates for all roads and segments
    const formattedRoads = roads.map(road => {
      let startCoord = null;
      let endCoord = null;
      
      try {
        startCoord = road.rStartCoord ? JSON.parse(road.rStartCoord) : null;
        endCoord = road.rEndCoord ? JSON.parse(road.rEndCoord) : null;
      } catch (e) {
        console.warn(`Failed to parse coordinates for road ${road.roadID}:`, e);
      }

      const formattedSegments = road.segments.map(segment => {
        let sStartCoord = null;
        let sEndCoord = null;
        
        try {
          sStartCoord = segment.sStartCoord ? JSON.parse(segment.sStartCoord) : null;
          sEndCoord = segment.sEndCoord ? JSON.parse(segment.sEndCoord) : null;
        } catch (e) {
          console.warn(`Failed to parse segment coordinates:`, e);
        }

        return {
          ...segment,
          sStartCoord,
          sEndCoord
        };
      });

      return {
        ...road,
        rStartCoord: startCoord,
        rEndCoord: endCoord,
        segments: formattedSegments
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRoads
    });
  } catch (error) {
    console.error('Get traveller map error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch map data',
      error: error.message
    });
  }
};

export const getTravellerRoute = async (req, res) => {
  try {
    const { segmentID } = req.query;

    if (!segmentID) {
      return res.status(400).json({
        success: false,
        message: 'Segment ID is required'
      });
    }

    const segment = await prisma.roadSegment.findUnique({
      where: { segmentID },
      include: {
        starRatings: {
          include: {
            navigationRoutes: true
          }
        },
        road: true
      }
    });

    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: segment
    });
  } catch (error) {
    console.error('Get traveller route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route',
      error: error.message
    });
  }
};

export const submitTravellerFeedback = async (req, res) => {
  try {
    const { email } = req.user;
    const { title, description, imageURL, coordinates, segmentID, roadID, feedbackType, location } = req.body;

    console.log('Feedback submission payload:', { title, description, coordinates, segmentID, roadID, feedbackType, location, email });

    // Validate required fields - only description and coordinates are mandatory
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (!coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are required'
      });
    }

    // Ensure coordinates has lat and lng
    if (!coordinates.lat || !coordinates.lng) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must have lat and lng properties'
      });
    }

    // Validate coordinate values
    const coordValidation = validateCoordinate(coordinates);
    if (!coordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid coordinates: ${coordValidation.error}`
      });
    }

    // Verify user exists in database before creating feedback
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    console.log('User verified:', user.email);

    // Sanitize coordinates for storage
    const sanitizedCoords = sanitizeCoordinate(coordinates);

    // Validate segmentID and roadID if provided
    let validSegmentID = null;
    let validRoadID = null;

    if (segmentID) {
      try {
        const segment = await prisma.roadSegment.findUnique({
          where: { segmentID }
        });
        if (segment) {
          validSegmentID = segmentID;
          validRoadID = segment.roadID; // Get road ID from segment
          console.log('Segment found:', segmentID, 'Road:', validRoadID);
        } else {
          console.warn('Segment not found:', segmentID);
        }
      } catch (segmentError) {
        console.error('Error validating segment:', segmentError.message);
      }
    }

    if (roadID && !validRoadID) {
      try {
        const road = await prisma.road.findUnique({
          where: { roadID }
        });
        if (road) {
          validRoadID = roadID;
          console.log('Road found:', roadID);
        } else {
          console.warn('Road not found:', roadID);
        }
      } catch (roadError) {
        console.error('Error validating road:', roadError.message);
      }
    }

    // Generate title if not provided
    let finalTitle = title;
    if (!finalTitle) {
      finalTitle = location || `Road Report at ${parseFloat(coordinates.lat).toFixed(4)}, ${parseFloat(coordinates.lng).toFixed(4)}`;
    }

    // Validate title length
    if (finalTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }

    // Validate description length
    if (description.length < 10 || description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 10 and 1000 characters'
      });
    }

    // Validate feedbackType
    const validFeedbackTypes = ['COMPLAINT', 'FEEDBACK', 'SUGGESTION'];
    const normalizedFeedbackType = (feedbackType || 'COMPLAINT').toUpperCase();
    if (!validFeedbackTypes.includes(normalizedFeedbackType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid feedback type. Must be one of: ${validFeedbackTypes.join(', ')}`
      });
    }

    const feedbackData = {
      title: finalTitle,
      description,
      imageURL: imageURL || null,
      coordinates: JSON.stringify(sanitizedCoords),
      status: 'PENDING',
      feedbackType: normalizedFeedbackType,
      email,
      segmentID: validSegmentID,
      roadID: validRoadID
    };

    console.log('Creating feedback with validated data:', feedbackData);

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: feedbackData
      });

      console.log('Feedback created successfully:', feedback.feedbackID);

      // Create notification for admins with location info
      const admins = await tx.user.findMany({
        where: { role: 'ADMIN' }
      });

      if (admins.length === 0) {
        console.warn('No admins found for notification');
      } else {
        const locationInfo = validSegmentID 
          ? `road segment ${validSegmentID}` 
          : `location (${parseFloat(coordinates.lat).toFixed(4)}, ${parseFloat(coordinates.lng).toFixed(4)})`;

        for (const admin of admins) {
          try {
            await tx.notification.create({
              data: {
                email: admin.email,
                message: `New ${normalizedFeedbackType.toLowerCase()} from traveller: "${description.substring(0, 50)}..." at ${locationInfo}. Status: Pending review.`,
                type: normalizedFeedbackType === 'COMPLAINT' ? 'FEEDBACK' : normalizedFeedbackType
              }
            });
            console.log('Notification created for admin:', admin.email);
          } catch (notificationError) {
            console.error('Error creating notification for admin', admin.email, ':', notificationError.message);
            // Don't fail the entire transaction just because notification failed
          }
        }
      }

      return feedback;
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Admin will review and respond.',
      data: result
    });
  } catch (error) {
    console.error('Submit traveller feedback error:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference in feedback data. Please ensure the road or segment ID is valid.',
        error: error.message
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A similar feedback already exists. Please avoid duplicates.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

export const getTravellerNotifications = async (req, res) => {
  try {
    const { email } = req.user;

    const notifications = await prisma.notification.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get traveller's complaint history
export const getMyComplaints = async (req, res) => {
  try {
    const { email } = req.user;

    const complaints = await prisma.feedback.findMany({
      where: { email },
      include: {
        road: true,
        segment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Get all roads and segments for complaint submission (with map data)
export const getRoadsForFeedback = async (req, res) => {
  try {
    const roads = await prisma.road.findMany({
      include: {
        segments: {
          select: {
            segmentID: true,
            sStartCoord: true,
            sEndCoord: true
          }
        }
      }
    });

    // Format roads with parsed coordinates for map display
    const formattedRoads = roads.map(road => {
      let startCoord = null;
      let endCoord = null;
      
      try {
        startCoord = JSON.parse(road.rStartCoord);
        endCoord = JSON.parse(road.rEndCoord);
      } catch (e) {
        // Ignore parsing errors
      }

      return {
        roadID: road.roadID,
        roadName: road.roadName,
        startCoord,
        endCoord,
        segments: road.segments.map((segment, index) => {
          let segStartCoord = null;
          let segEndCoord = null;
          
          try {
            segStartCoord = JSON.parse(segment.sStartCoord);
            segEndCoord = JSON.parse(segment.sEndCoord);
          } catch (e) {
            // Ignore parsing errors
          }

          return {
            segmentID: segment.segmentID,
            segmentName: `Segment ${index + 1}`,
            startCoord: segStartCoord,
            endCoord: segEndCoord
          };
        })
      };
    });

    res.status(200).json({
      success: true,
      data: formattedRoads
    });
  } catch (error) {
    console.error('Get roads for feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roads',
      error: error.message
    });
  }
};
