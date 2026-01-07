import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate the onboarding link
  const onboardingLink = `${window.location.origin}/onboarding`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(onboardingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent('Complete Your Employee Onboarding');
    const body = encodeURIComponent(
      `Hello,\n\nPlease complete your employee onboarding by filling out the form at the link below:\n\n${onboardingLink}\n\nThis form will collect your personal, employment, and banking information needed for your salary setup.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nHR Team`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Onboarding Link" size="md">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Employee Onboarding Form
              </h3>
              <p className="text-sm text-gray-600">
                Share this link with new employees to collect their information
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              value={onboardingLink}
              readOnly
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">What information will be collected?</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Personal Info</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Name & Contact</li>
                <li>• Address</li>
                <li>• Emergency Contact</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Employment</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Role & Department</li>
                <li>• Tech Stack</li>
                <li>• Salary Info</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Banking</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Bank Details</li>
                <li>• IBAN</li>
                <li>• SWIFT Code</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Payoneer</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                <li>• Payoneer Email</li>
                <li>• Account ID</li>
                <li>• Optional</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This link is public and doesn't require authentication. 
            Make sure to share it only with authorized individuals.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleShareViaEmail} variant="primary" className="flex-1">
            Share via Email
          </Button>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareLinkModal;

