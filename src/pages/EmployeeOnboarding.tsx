import React, { useState } from 'react';
import { UserPlus, Building2, CreditCard, Mail, Check } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { EmployeeRole } from '../types';

interface OnboardingFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Employment Information
  role: string;
  department: string;
  joiningDate: string;
  
  // Banking Information
  bankName: string;
  accountHolderName: string;
  iban: string;
  swiftCode: string;
  
  // Payoneer Information (Optional)
  hasPayoneer: boolean;
  payoneerEmail: string;
  payoneerAccountId: string;
  
  // Technical Information (for developers)
  techStack: string[];
}

const EmployeeOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [techInput, setTechInput] = useState('');

  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    role: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    bankName: '',
    accountHolderName: '',
    iban: '',
    swiftCode: '',
    hasPayoneer: false,
    payoneerEmail: '',
    payoneerAccountId: '',
    techStack: [],
  });

  const handleChange = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      handleChange('techStack', [...formData.techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    handleChange('techStack', formData.techStack.filter(t => t !== tech));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Information
        if (!formData.name || !formData.email || !formData.phone) {
          setError('Please fill in all required personal information fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 2: // Employment Information
        if (!formData.role || !formData.department) {
          setError('Please fill in all required employment information fields');
          return false;
        }
        break;
      case 3: // Banking Information
        if (!formData.bankName || !formData.accountHolderName || !formData.iban) {
          setError('Please fill in all required banking information fields');
          return false;
        }
        break;
      case 4: // Payoneer Information
        if (formData.hasPayoneer && !formData.payoneerEmail) {
          setError('Please provide your Payoneer email address');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setError('');

    try {
      // Prepare the data for submission - flat structure matching backend model
      const onboardingData = {
        // Personal Information
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        
        // Employment Information
        role: formData.role,
        department: formData.department,
        joiningDate: formData.joiningDate,
        techStack: formData.techStack,
        
        // Banking Information
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        iban: formData.iban,
        swiftCode: formData.swiftCode,
        
        // Payoneer Information
        hasPayoneer: formData.hasPayoneer,
        payoneerEmail: formData.hasPayoneer ? formData.payoneerEmail : undefined,
        payoneerAccountId: formData.hasPayoneer ? formData.payoneerAccountId : undefined,
      };

      // Submit to backend onboarding endpoint (public - no auth required)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/onboarding/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit onboarding');
      }
      
      setSuccess(true);
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setError(err.response?.data?.message || 'Failed to submit onboarding form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: UserPlus },
    { number: 2, title: 'Employment', icon: Building2 },
    { number: 3, title: 'Banking', icon: CreditCard },
    { number: 4, title: 'Payoneer', icon: Mail },
    { number: 5, title: 'Complete', icon: Check },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-success-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
          <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome Aboard! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            Your information has been successfully submitted. Our HR team will review your details and contact you shortly.
          </p>
          <div className="bg-success-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-success-800">
              <strong>What's Next?</strong><br />
              You'll receive an email with your login credentials and further instructions within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Employee Onboarding
          </h1>
          <p className="text-gray-600">
            Welcome! Please fill in your details to complete the onboarding process
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <p className={`mt-2 text-xs font-medium ${
                    currentStep >= step.number ? 'text-primary-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                      currentStep > step.number ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                    style={{ marginBottom: '32px' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, City, Country"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Emergency Contact Name"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          )}

          {/* Step 2: Employment Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Employment Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  options={Object.values(EmployeeRole).map(role => ({
                    value: role,
                    label: role,
                  }))}
                  required
                />
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Engineering"
                  required
                  helperText="Enter your department name"
                />
                <Input
                  label="Joining Date"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your base salary will be discussed and set by HR during the review process.
                </p>
              </div>

              {/* Tech Stack (for developers) */}
              {(formData.role === EmployeeRole.DEVELOPER || formData.role === EmployeeRole.TEAM_LEAD) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tech Stack / Skills
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g., React, Node.js, Python"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTech} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Banking Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Banking Information</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your banking information is encrypted and securely stored. It will only be used for salary payments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="Bank of America"
                  required
                />
                <Input
                  label="Account Holder Name"
                  value={formData.accountHolderName}
                  onChange={(e) => handleChange('accountHolderName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <Input
                label="IBAN / Account Number"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="DE89370400440532013000"
                required
                helperText="International Bank Account Number"
              />

              <Input
                label="SWIFT/BIC Code"
                value={formData.swiftCode}
                onChange={(e) => handleChange('swiftCode', e.target.value)}
                placeholder="DEUTDEFF"
                helperText="Optional but recommended for international transfers"
              />
            </div>
          )}

          {/* Step 4: Payoneer Information */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payoneer Information (Optional)</h2>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-800">
                  <strong>Optional:</strong> If you have a Payoneer account and prefer to receive payments through it, please provide your details below.
                </p>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <input
                  type="checkbox"
                  id="hasPayoneer"
                  checked={formData.hasPayoneer}
                  onChange={(e) => handleChange('hasPayoneer', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="hasPayoneer" className="text-sm font-medium text-gray-700">
                  I have a Payoneer account
                </label>
              </div>

              {formData.hasPayoneer && (
                <div className="space-y-6 animate-fade-in">
                  <Input
                    label="Payoneer Email Address"
                    type="email"
                    value={formData.payoneerEmail}
                    onChange={(e) => handleChange('payoneerEmail', e.target.value)}
                    placeholder="john.doe@payoneer.com"
                    required={formData.hasPayoneer}
                    helperText="The email address associated with your Payoneer account"
                  />
                  <Input
                    label="Payoneer Account ID (Optional)"
                    value={formData.payoneerAccountId}
                    onChange={(e) => handleChange('payoneerAccountId', e.target.value)}
                    placeholder="P123456789"
                    helperText="You can find this in your Payoneer account settings"
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && currentStep < 5 && (
              <Button onClick={handleBack} variant="secondary">
                Back
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={handleNext} variant="primary" className="ml-auto">
                Next
              </Button>
            ) : currentStep === 4 && (
              <Button
                onClick={handleSubmit}
                variant="success"
                loading={loading}
                className="ml-auto"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact HR at{' '}
            <a href="mailto:triageai@info.com" className="text-primary-600 hover:text-primary-700 font-medium">
              triageai@info.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;

