/**
 * Email validation utilities
 * Prevents malformed emails like missing TLDs (e.g., "user@gmail" instead of "user@gmail.com")
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format with strict checks for proper TLD
 * @param email - The email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();

  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }

  // Check for spaces
  if (trimmed.includes(' ')) {
    return { isValid: false, error: 'Email cannot contain spaces' };
  }

  // Basic format check: must have exactly one @ symbol
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount === 0) {
    return { isValid: false, error: 'Email must contain @ symbol' };
  }
  if (atCount > 1) {
    return { isValid: false, error: 'Email cannot contain multiple @ symbols' };
  }

  // Check @ is not at start or end
  if (trimmed.startsWith('@') || trimmed.endsWith('@')) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Split into local and domain parts
  const [localPart, domainPart] = trimmed.split('@');

  // Check local part exists
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: 'Email address is incomplete' };
  }

  // Check domain part exists and has a dot
  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: false, error: 'Email must include a domain (e.g., gmail.com)' };
  }

  // Check domain has proper TLD (at least 2 characters after last dot)
  const domainParts = domainPart.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Email must have a valid domain extension (e.g., .com, .org)' };
  }

  // Check TLD contains only letters (no numbers or special chars)
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Invalid domain extension' };
  }

  // Full regex validation for proper email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates and normalizes email (lowercase, trimmed)
 * @param email - The email address to validate and normalize
 * @returns Normalized email or throws error if invalid
 */
export function validateAndNormalizeEmail(email: string): string {
  const validation = validateEmail(email);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return email.trim().toLowerCase();
}
