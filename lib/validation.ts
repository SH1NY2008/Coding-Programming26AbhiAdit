/**
 * Input Validation Utilities
 * 
 * This module provides comprehensive validation functions for all user inputs
 * in the Byte-Sized Business Boost application. Includes both syntactical and
 * semantic validation with user-friendly error messages.
 * 
 * @module validation
 */

/**
 * Validation result object returned by all validation functions
 */
export interface ValidationResult {
  isValid: boolean
  message: string
}

/**
 * Validates email address format
 * Checks for proper structure: local@domain.tld
 * 
 * @param email - The email address to validate
 * @returns ValidationResult with status and message
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email address is required' }
  }
  
  // Check for @ symbol
  if (!email.includes('@')) {
    return { isValid: false, message: 'Email must include @ symbol' }
  }
  
  // Split and check parts
  const parts = email.split('@')
  if (parts.length !== 2) {
    return { isValid: false, message: 'Email must have exactly one @ symbol' }
  }
  
  const [local, domain] = parts
  
  if (local.length === 0) {
    return { isValid: false, message: 'Email must have a username before @' }
  }
  
  if (domain.length === 0) {
    return { isValid: false, message: 'Email must have a domain after @' }
  }
  
  if (!domain.includes('.')) {
    return { isValid: false, message: 'Email domain must include a period (e.g., .com)' }
  }
  
  // Check for valid characters
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email contains invalid characters' }
  }
  
  return { isValid: true, message: 'Valid email address' }
}

/**
 * Validates US phone number format
 * Accepts various formats: (555) 123-4567, 555-123-4567, 5551234567
 * 
 * @param phone - The phone number to validate
 * @returns ValidationResult with status and message
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Phone number is required' }
  }
  
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length < 10) {
    return { isValid: false, message: 'Phone number must have at least 10 digits' }
  }
  
  if (digits.length > 11) {
    return { isValid: false, message: 'Phone number has too many digits' }
  }
  
  // Check if starts with 1 (US country code) or valid area code
  if (digits.length === 11 && digits[0] !== '1') {
    return { isValid: false, message: 'Phone number with country code must start with 1' }
  }
  
  // Validate area code (first 3 digits after country code)
  const areaCode = digits.length === 11 ? digits.slice(1, 4) : digits.slice(0, 3)
  if (areaCode[0] === '0' || areaCode[0] === '1') {
    return { isValid: false, message: 'Area code cannot start with 0 or 1' }
  }
  
  return { isValid: true, message: 'Valid phone number' }
}

/**
 * Validates US ZIP code format
 * Accepts 5-digit or 9-digit (ZIP+4) formats
 * 
 * @param zipCode - The ZIP code to validate
 * @returns ValidationResult with status and message
 */
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, message: 'ZIP code is required' }
  }
  
  // Remove any spaces or hyphens for checking
  const cleaned = zipCode.replace(/[\s-]/g, '')
  
  // Check if all digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, message: 'ZIP code must contain only numbers' }
  }
  
  // Check length
  if (cleaned.length !== 5 && cleaned.length !== 9) {
    return { isValid: false, message: 'ZIP code must be 5 digits (or 9 for ZIP+4)' }
  }
  
  // Basic range check (US ZIP codes)
  const numericZip = parseInt(cleaned.slice(0, 5))
  if (numericZip < 501 || numericZip > 99950) {
    return { isValid: false, message: 'Please enter a valid US ZIP code' }
  }
  
  return { isValid: true, message: 'Valid ZIP code' }
}

/**
 * Validates review text content
 * Checks length, content quality, and spam indicators
 * 
 * @param review - The review text to validate
 * @returns ValidationResult with status and message
 */
export const validateReview = (review: string): ValidationResult => {
  if (!review || review.trim() === '') {
    return { isValid: false, message: 'Review text is required' }
  }
  
  const trimmed = review.trim()
  
  // Minimum length check
  if (trimmed.length < 10) {
    return { isValid: false, message: 'Review must be at least 10 characters long' }
  }
  
  // Maximum length check
  if (trimmed.length > 500) {
    return { isValid: false, message: `Review must be 500 characters or less (currently ${trimmed.length})` }
  }
  
  // Check for excessive repeated characters (spam indicator)
  if (/(.)\1{5,}/.test(trimmed)) {
    return { isValid: false, message: 'Review contains too many repeated characters' }
  }
  
  // Check for URLs (often spam)
  if (/https?:\/\/|www\./i.test(trimmed)) {
    return { isValid: false, message: 'Reviews cannot contain URLs or links' }
  }
  
  // Check for HTML tags
  if (/<[^>]+>/.test(trimmed)) {
    return { isValid: false, message: 'Reviews cannot contain HTML code' }
  }
  
  // Check for excessive caps (shouting)
  const capsRatio = (trimmed.match(/[A-Z]/g) || []).length / trimmed.length
  if (capsRatio > 0.7 && trimmed.length > 20) {
    return { isValid: false, message: 'Please avoid using excessive capital letters' }
  }
  
  return { isValid: true, message: 'Valid review' }
}

/**
 * Validates star rating value
 * Accepts ratings from 0.5 to 5 in half-star increments
 * 
 * @param rating - The rating value to validate
 * @returns ValidationResult with status and message
 */
export const validateRating = (rating: number): ValidationResult => {
  if (rating === undefined || rating === null) {
    return { isValid: false, message: 'Please select a rating' }
  }
  
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { isValid: false, message: 'Rating must be a number' }
  }
  
  if (rating < 0.5) {
    return { isValid: false, message: 'Rating must be at least 0.5 stars' }
  }
  
  if (rating > 5) {
    return { isValid: false, message: 'Rating cannot exceed 5 stars' }
  }
  
  // Check for valid half-star increments
  if ((rating * 2) % 1 !== 0) {
    return { isValid: false, message: 'Rating must be in half-star increments' }
  }
  
  return { isValid: true, message: 'Valid rating' }
}

/**
 * Validates user display name
 * Checks for appropriate length and characters
 * 
 * @param name - The display name to validate
 * @returns ValidationResult with status and message
 */
export const validateDisplayName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Display name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Display name must be at least 2 characters' }
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, message: 'Display name must be 50 characters or less' }
  }
  
  // Allow letters, numbers, spaces, periods, and hyphens
  if (!/^[a-zA-Z0-9.\- ]+$/.test(trimmed)) {
    return { isValid: false, message: 'Display name can only contain letters, numbers, spaces, periods, and hyphens' }
  }
  
  return { isValid: true, message: 'Valid display name' }
}

/**
 * Validates search query input
 * Sanitizes and checks for valid search terms
 * 
 * @param query - The search query to validate
 * @returns ValidationResult with status and sanitized query
 */
export const validateSearchQuery = (query: string): ValidationResult & { sanitized?: string } => {
  if (!query || query.trim() === '') {
    return { isValid: true, message: 'Empty search returns all results', sanitized: '' }
  }
  
  const trimmed = query.trim()
  
  if (trimmed.length > 100) {
    return { isValid: false, message: 'Search query is too long (max 100 characters)' }
  }
  
  // Remove any potentially harmful characters
  const sanitized = trimmed.replace(/[<>{}[\]\\]/g, '')
  
  return { isValid: true, message: 'Valid search query', sanitized }
}

/**
 * Validates URL format
 * Checks for proper structure and common protocols
 * 
 * @param url - The URL to validate
 * @returns ValidationResult with status and message
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: true, message: 'URL is optional' }
  }
  
  const trimmed = url.trim()
  
  // Add protocol if missing
  let fullUrl = trimmed
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    fullUrl = 'https://' + trimmed
  }
  
  try {
    const urlObj = new URL(fullUrl)
    
    // Check for valid domain
    if (!urlObj.hostname.includes('.')) {
      return { isValid: false, message: 'URL must include a valid domain (e.g., example.com)' }
    }
    
    // Check for common TLDs
    const tld = urlObj.hostname.split('.').pop()
    if (!tld || tld.length < 2) {
      return { isValid: false, message: 'URL must have a valid domain extension' }
    }
    
    return { isValid: true, message: 'Valid URL' }
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' }
  }
}

/**
 * Validates folder name for bookmarks
 * 
 * @param name - The folder name to validate
 * @returns ValidationResult with status and message
 */
export const validateFolderName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, message: 'Folder name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 1) {
    return { isValid: false, message: 'Folder name cannot be empty' }
  }
  
  if (trimmed.length > 30) {
    return { isValid: false, message: 'Folder name must be 30 characters or less' }
  }
  
  return { isValid: true, message: 'Valid folder name' }
}

/**
 * Generic form validation helper
 * Validates multiple fields at once and returns all errors
 * 
 * @param fields - Object with field names and their validators
 * @returns Object with overall validity and field-specific errors
 */
export const validateForm = (
  fields: { [key: string]: { value: unknown; validator: (val: unknown) => ValidationResult } }
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {}
  let isValid = true
  
  for (const [field, { value, validator }] of Object.entries(fields)) {
    const result = validator(value)
    if (!result.isValid) {
      isValid = false
      errors[field] = result.message
    }
  }
  
  return { isValid, errors }
}
