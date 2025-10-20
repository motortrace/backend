// InspectionStatus enum values based on Prisma schema
// Using string literals until Prisma client is regenerated with the enum
export enum InspectionStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * State transition matrix defining valid transitions between inspection statuses
 * Based on requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */
const STATE_TRANSITION_MATRIX: Record<InspectionStatus, InspectionStatus[]> = {
  [InspectionStatus.PENDING]: [InspectionStatus.ONGOING, InspectionStatus.CANCELLED],
  [InspectionStatus.ONGOING]: [InspectionStatus.COMPLETED, InspectionStatus.CANCELLED],
  [InspectionStatus.COMPLETED]: [], // Terminal state - no transitions allowed
  [InspectionStatus.CANCELLED]: [], // Terminal state - no transitions allowed
};

/**
 * Validates if a state transition is allowed based on the state transition matrix
 * 
 * @param currentStatus - The current inspection status
 * @param targetStatus - The desired target status
 * @returns true if the transition is valid, false otherwise
 */
export function isValidTransition(
  currentStatus: InspectionStatus,
  targetStatus: InspectionStatus
): boolean {
  const allowedTransitions = STATE_TRANSITION_MATRIX[currentStatus];
  return allowedTransitions.includes(targetStatus);
}

/**
 * Returns the list of allowed transitions for a given status
 * 
 * @param currentStatus - The current inspection status
 * @returns Array of allowed target statuses
 */
export function getAllowedTransitions(currentStatus: InspectionStatus): InspectionStatus[] {
  return STATE_TRANSITION_MATRIX[currentStatus] || [];
}

/**
 * Generates a descriptive error message for invalid state transitions
 * Requirement 3.6: Return descriptive error message indicating current status and allowed transitions
 * 
 * @param inspectionId - The ID of the inspection
 * @param currentStatus - The current inspection status
 * @param targetStatus - The attempted target status
 * @returns Formatted error message
 */
export function generateTransitionErrorMessage(
  inspectionId: string,
  currentStatus: InspectionStatus,
  targetStatus: InspectionStatus
): string {
  const allowedTransitions = getAllowedTransitions(currentStatus);
  
  // Check if it's a terminal state
  if (allowedTransitions.length === 0) {
    return `Cannot modify inspection ${inspectionId} in ${currentStatus} status. This is a terminal state.`;
  }
  
  // Generate error with allowed transitions
  const allowedTransitionsStr = allowedTransitions.join(', ');
  return `Invalid status transition from ${currentStatus} to ${targetStatus} for inspection ${inspectionId}. Allowed transitions: ${allowedTransitionsStr}`;
}

/**
 * Checks if a status is a terminal state (no further transitions allowed)
 * 
 * @param status - The inspection status to check
 * @returns true if the status is terminal, false otherwise
 */
export function isTerminalState(status: InspectionStatus): boolean {
  return getAllowedTransitions(status).length === 0;
}
