import React from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Input, Button, Card } from '../ui'
import { DecisionFormProps, DecisionForm as DecisionFormData } from '../../types/components'
import ProsConsList from './ProsConsList'

const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  pros,
  cons,
  currentPro,
  currentCon,
  starredPro,
  starredCon,
  validationError,
  isLoading,
  onProChange,
  onConChange,
  onAddPro,
  onAddCon,
  onRemovePro,
  onRemoveCon,
  onStarPro,
  onStarCon,
  isTimerActive
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DecisionFormData>({
    defaultValues: {
      timerMinutes: 10
    }
  })

  return (
    <Card padding="lg" rounded="2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          {...register('question', { required: 'Question is required' })}
          label="What decision do you need to make?"
          placeholder="Should I launch this project today?"
          error={errors.question?.message}
          isRequired
          className="text-lg"
        />

        <ProsConsList
          pros={pros}
          cons={cons}
          currentPro={currentPro}
          currentCon={currentCon}
          starredPro={starredPro}
          starredCon={starredCon}
          onProChange={onProChange}
          onConChange={onConChange}
          onAddPro={onAddPro}
          onAddCon={onAddCon}
          onRemovePro={onRemovePro}
          onRemoveCon={onRemoveCon}
          onStarPro={onStarPro}
          onStarCon={onStarCon}
          isTimerActive={isTimerActive}
        />

        <div>
          <label className="block text-base sm:text-lg font-semibold mb-3 text-gray-800">
            Decision Timer
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <input
                {...register('timerMinutes', { 
                  required: 'Timer is required',
                  min: { value: 1, message: 'Minimum 1 minute' },
                  max: { value: 15, message: 'Maximum 15 minutes' }
                })}
                type="number"
                min="1"
                max="15"
                inputMode="numeric"
                className="w-20 sm:w-28 px-3 py-3 min-h-[44px] text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <span className="text-gray-600">minutes</span>
            </div>
            <div className="text-sm text-gray-500">
              ⏱️ Time&apos;s up = Decision made. No takebacks.
            </div>
          </div>
          {errors.timerMinutes && (
            <p className="text-red-500 mt-1 text-sm">{errors.timerMinutes.message}</p>
          )}
        </div>

        {validationError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center text-red-700"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </motion.div>
        )}

        <div className="flex flex-col items-center pt-4 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Timer & Commit'}
          </Button>
          
          <p className="text-sm text-gray-500">
            Join <span className="font-semibold text-blue-600">147</span> overthinkers making faster decisions
          </p>
        </div>

        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Press Enter to add pros/cons quickly</p>
          <p>⌨️ Use Ctrl+Enter to add items, ESC to cancel timer</p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <blockquote className="text-gray-700 italic mb-2">
              &ldquo;I spent 3 weeks deciding on a job offer. This forced me to choose in 5 minutes. Best decision ever.&rdquo;
            </blockquote>
            <cite className="text-sm text-blue-600 font-medium">- Reddit user</cite>
          </div>
        </div>
      </form>
    </Card>
  )
}

export default DecisionForm