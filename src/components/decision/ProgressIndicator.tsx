import React from 'react'
import { ProgressIndicatorProps } from '../../types/components'

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <div 
      className="flex items-center justify-center mb-6 sm:mb-8" 
      role="progressbar" 
      aria-label="Decision creation progress" 
      aria-valuenow={currentStep === 'setup' ? 1 : currentStep === 'timer' ? 2 : 3} 
      aria-valuemin={1} 
      aria-valuemax={3}
    >
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        <div className={`flex items-center space-x-2 ${
          currentStep === 'setup' ? 'text-blue-600' : 'text-green-600'
        }`}>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'setup' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-50'
            }`}
            aria-label={currentStep === 'setup' ? 'Current step: Setup' : 'Completed: Setup'}
          >
            {currentStep === 'setup' ? '1' : '✓'}
          </div>
          <span className="font-medium text-sm hidden sm:inline">Setup</span>
        </div>
        
        <div className={`w-6 md:w-8 h-1 rounded ${
          currentStep === 'setup' ? 'bg-gray-200' : 'bg-green-200'
        }`} />
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'timer' ? 'text-blue-600' : 
          currentStep === 'result' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'timer' ? 'border-blue-600 bg-blue-50' : 
            currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            {currentStep === 'result' ? '✓' : '2'}
          </div>
          <span className="font-medium text-sm hidden sm:inline">Timer</span>
        </div>
        
        <div className={`w-6 md:w-8 h-1 rounded ${
          currentStep === 'result' ? 'bg-green-200' : 'bg-gray-200'
        }`} />
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'result' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'result' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            {currentStep === 'result' ? '✓' : '3'}
          </div>
          <span className="font-medium text-sm hidden sm:inline">Result</span>
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator