import { Check } from 'lucide-react';

interface PasswordValidationProps {
  password: string;
}

export const PasswordValidation = ({ password }: PasswordValidationProps) => {
  const validations = [
    {
      test: (pwd: string) => pwd.length >= 8,
      message: 'At least 8 characters long',
    },
    {
      test: (pwd: string) => /[A-Z]/.test(pwd),
      message: 'Contains at least one uppercase letter',
    },
    {
      test: (pwd: string) => /[a-z]/.test(pwd),
      message: 'Contains at least one lowercase letter',
    },
    {
      test: (pwd: string) => /[0-9]/.test(pwd),
      message: 'Contains at least one number',
    },
    {
      test: (pwd: string) => /[\W_]/.test(pwd),
      message: 'Contains at least one special character',
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Password requirements:</p>
      {validations.map((validation, index) => {
        const isValid = validation.test(password);
        return (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isValid 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {isValid && <Check size={10} className="text-white" />}
            </div>
            <span className={`text-xs ${
              isValid 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {validation.message}
            </span>
          </div>
        );
      })}
    </div>
  );
};
