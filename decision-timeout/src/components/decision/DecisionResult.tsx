import React from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '../ui'
import { DecisionResultProps } from '../../types/components'

const DecisionResult: React.FC<DecisionResultProps> = ({
  result,
  decisionLogic,
  onReset,
  onViewHistory
}) => {
  const resultColor = result === 'YES' ? 'text-green-600' : 'text-red-600'

  return (
    <Card padding="lg" rounded="2xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl font-bold text-gray-800 mb-4"
        >
          Decision Made!
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-5xl md:text-8xl font-black mb-6 ${resultColor}`}
        >
          {result}
        </motion.div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Decision Logic:</p>
          <p className="text-gray-800">{decisionLogic}</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-amber-600 mb-6">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">This decision is locked for 30 days</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onReset}
            variant="primary"
            size="md"
          >
            Make Another Decision
          </Button>
          <Button
            onClick={onViewHistory}
            variant="secondary"
            size="md"
          >
            View History
          </Button>
        </div>
      </motion.div>
    </Card>
  )
}

export default DecisionResult