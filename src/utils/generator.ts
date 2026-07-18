import { GeneratorConfig } from '../types';

export function generateToken(config: GeneratorConfig): string {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const similarChars = /[ilI1oO0]/g;

  let charPool = '';
  let requiredChars: string[] = [];

  // Filter similar characters if needed
  const filterSimilar = (str: string) => {
    return config.excludeSimilar ? str.replace(similarChars, '') : str;
  };

  const allowedLowercase = filterSimilar(lowercaseChars);
  const allowedUppercase = filterSimilar(uppercaseChars);
  const allowedNumbers = filterSimilar(numberChars);
  const allowedSymbols = filterSimilar(symbolChars);

  if (config.includeLowercase && allowedLowercase.length > 0) {
    charPool += allowedLowercase;
    // Ensure at least one lowercase character is included
    requiredChars.push(allowedLowercase[Math.floor(Math.random() * allowedLowercase.length)]);
  }

  if (config.includeUppercase && allowedUppercase.length > 0) {
    charPool += allowedUppercase;
    // Ensure at least one uppercase character is included
    requiredChars.push(allowedUppercase[Math.floor(Math.random() * allowedUppercase.length)]);
  }

  if (config.includeNumbers && allowedNumbers.length > 0) {
    charPool += allowedNumbers;
    // Ensure at least one number is included
    requiredChars.push(allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)]);
  }

  if (config.includeSymbols && allowedSymbols.length > 0) {
    charPool += allowedSymbols;
    // Ensure at least one symbol is included
    requiredChars.push(allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)]);
  }

  // If no pools are selected, default to lowercase + numbers + symbols
  if (charPool === '') {
    charPool = allowedLowercase + allowedNumbers + allowedSymbols;
    requiredChars.push(allowedLowercase[Math.floor(Math.random() * allowedLowercase.length)]);
    requiredChars.push(allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)]);
    requiredChars.push(allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)]);
  }

  const generatedLength = config.length;
  let result = [...requiredChars];

  // Fill the rest of the length with random characters from the pool
  for (let i = result.length; i < generatedLength; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    result.push(charPool[randomIndex]);
  }

  // Shuffle the array to distribute the required characters randomly
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join('');
}

export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 4
  feedback: string;
  feedbackAr: string;
  color: string;
} {
  if (!password) {
    return { score: 0, feedback: 'Enter a password', feedbackAr: 'أدخل كلمة مرور', color: 'bg-gray-600' };
  }

  let score = 0;
  
  // Length contribution
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (password.length >= 24) score++; // Max length bonus (matching our 24 target)

  // Character variety checking
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  
  if (varietyCount >= 3) score++;

  let feedback = 'Weak';
  let feedbackAr = 'ضعيف جداً';
  let color = 'bg-red-500';

  if (score === 1) {
    feedback = 'Fair';
    feedbackAr = 'ضعيف';
    color = 'bg-orange-500';
  } else if (score === 2) {
    feedback = 'Good';
    feedbackAr = 'متوسط';
    color = 'bg-yellow-500';
  } else if (score === 3) {
    feedback = 'Strong';
    feedbackAr = 'قوي';
    color = 'bg-blue-500';
  } else if (score >= 4) {
    feedback = 'Ultra Secure';
    feedbackAr = 'آمن للغاية 🔒';
    color = 'bg-emerald-500';
  }

  return { score: Math.min(score, 4), feedback, feedbackAr, color };
}
