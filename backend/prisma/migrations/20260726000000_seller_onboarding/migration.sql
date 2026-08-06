-- Add 'draft' to ApprovalStatus enum
-- Must be in its own transaction/migration before it can be used
ALTER TYPE "ApprovalStatus" ADD VALUE IF NOT EXISTS 'draft';
