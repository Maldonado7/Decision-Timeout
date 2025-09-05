import React from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '../ui'
import { DecisionTimerProps } from '../../types/components'

const DecisionTimer: React.FC<DecisionTimerProps> = ({
  timeRemaining,
  pros,
  cons,
  onCancel,
  formatTime
}) => {
  const isUrgent = timeRemaining <= 30

  return (
    <Card padding="lg" rounded="2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Time to Decide!</h3>
        
        <div className={`text-4xl sm:text-6xl lg:text-8xl font-mono font-bold mb-4 ${
          isUrgent ? 'text-red-500 animate-pulse' : 'text-blue-600'
        }`}>
          {formatTime(timeRemaining)}
        </div>
        
        {isUrgent && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 font-medium mb-4"
          >
            ⚠️ Time&apos;s up = Decision made. No takebacks in {timeRemaining} seconds!
          </motion.p>
        )}
        
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 text-left">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pros ({pros.length})
            </h4>
            {pros.map((pro, index) => (
              <motion.div 
                key={index} 
                className="bg-green-50 p-2 rounded text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {pro}
              </motion.div>
            ))}
            {pros.length === 0 && (
              <div className="text-gray-400 text-sm italic">No pros added</div>
            )}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-red-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Cons ({cons.length})
            </h4>
            {cons.map((con, index) => (
              <motion.div 
                key={index} 
                className="bg-red-50 p-2 rounded text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {con}
              </motion.div>
            ))}
            {cons.length === 0 && (
              <div className="text-gray-400 text-sm italic">No cons added</div>
            )}
          </div>
        </div>
        
        <Button
          onClick={onCancel}
          variant="secondary"
          size="md"
        >
          Cancel Timer (ESC)
        </Button>
      </motion.div>
    </Card>
  )
}

export default DecisionTimer