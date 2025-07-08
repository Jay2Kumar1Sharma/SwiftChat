import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const criteria: PasswordCriteria[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const passedCriteria = criteria.filter(criterion => criterion.test(password));
  const strength = passedCriteria.length;
  
  const getStrengthColor = (strength: number): string => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength)}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength < 2 ? 'text-red-600' : 
          strength < 4 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getStrengthText(strength)}
        </span>
      </div>
      
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              criterion.test(password) ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={`text-xs ${
              criterion.test(password) ? 'text-green-600' : 'text-gray-500'
            }`}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
