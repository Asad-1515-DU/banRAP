-- Migration: Fix data integrity issues in BanRAP
-- Date: 2026-04-21
-- Description: Add unique constraints, indexes, and cascading deletes

-- 1. Add unique constraint to Label to prevent multiple labels per annotator per segment
ALTER TABLE "labels"
ADD CONSTRAINT "labels_segment_annotator_unique" 
UNIQUE ("segmentID", "annotatorID");

-- 2. Add index on Label for faster queries
CREATE INDEX IF NOT EXISTS "labels_segmentID_idx" ON "labels"("segmentID");
CREATE INDEX IF NOT EXISTS "labels_annotatorID_idx" ON "labels"("annotatorID");
CREATE INDEX IF NOT EXISTS "labels_adminID_idx" ON "labels"("adminID");
CREATE INDEX IF NOT EXISTS "labels_isVerified_idx" ON "labels"("isVerified");

-- 3. Add unique constraint to StarRating to prevent duplicates
ALTER TABLE "star_ratings"
ADD CONSTRAINT "star_ratings_segment_road_unique"
UNIQUE ("segmentID", "roadID");

-- 4. Add indexes to StarRating
CREATE INDEX IF NOT EXISTS "star_ratings_segmentID_idx" ON "star_ratings"("segmentID");
CREATE INDEX IF NOT EXISTS "star_ratings_roadID_idx" ON "star_ratings"("roadID");

-- 5. Add indexes to RoadSegment
CREATE INDEX IF NOT EXISTS "road_segments_roadID_idx" ON "road_segments"("roadID");
CREATE INDEX IF NOT EXISTS "road_segments_createdAt_idx" ON "road_segments"("createdAt");

-- 6. Add indexes to Feedback for better query performance
CREATE INDEX IF NOT EXISTS "feedbacks_email_idx" ON "feedbacks"("email");
CREATE INDEX IF NOT EXISTS "feedbacks_status_idx" ON "feedbacks"("status");
CREATE INDEX IF NOT EXISTS "feedbacks_segmentID_idx" ON "feedbacks"("segmentID");
CREATE INDEX IF NOT EXISTS "feedbacks_roadID_idx" ON "feedbacks"("roadID");
CREATE INDEX IF NOT EXISTS "feedbacks_assignedAnnotatorID_idx" ON "feedbacks"("assignedAnnotatorID");
CREATE INDEX IF NOT EXISTS "feedbacks_createdAt_idx" ON "feedbacks"("createdAt");

-- 7. Add ON DELETE CASCADE to Label.annotatorID (was missing)
ALTER TABLE "labels" DROP CONSTRAINT IF EXISTS "labels_annotatorID_fkey";
ALTER TABLE "labels"
ADD CONSTRAINT "labels_annotatorID_fkey"
FOREIGN KEY ("annotatorID") REFERENCES "annotators"("annotatorID")
ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. Update Label.adminID to ON DELETE SET NULL if needed
ALTER TABLE "labels" DROP CONSTRAINT IF EXISTS "labels_adminID_fkey";
ALTER TABLE "labels"
ADD CONSTRAINT "labels_adminID_fkey"
FOREIGN KEY ("adminID") REFERENCES "admins"("adminID")
ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. Clean up duplicate star ratings (keep most recent)
DELETE FROM "star_ratings" a
WHERE "createdAt" < (
  SELECT MAX("createdAt")
  FROM "star_ratings" b
  WHERE a."segmentID" = b."segmentID" 
    AND a."roadID" = b."roadID"
);

-- 10. Remove any duplicate labels (keep the first/earliest one per annotator per segment)
DELETE FROM "labels" a
WHERE "createdAt" > (
  SELECT MIN("createdAt")
  FROM "labels" b
  WHERE a."segmentID" = b."segmentID" 
    AND a."annotatorID" = b."annotatorID"
);
