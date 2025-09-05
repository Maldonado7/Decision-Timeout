import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui'
import { ProsConsListProps } from '../../types/components'

const ProConsItem: React.FC<{
  item: string
  index: number
  type: 'pro' | 'con'
  isStarred: boolean
  onStar: (index: number | null) => void
  onRemove: (index: number) => void
  canEdit: boolean
}> = ({ item, index, type, isStarred, onStar, onRemove, canEdit }) => {
  const colorClasses = type === 'pro' 
    ? {
        base: isStarred ? 'bg-green-100 border-2 border-green-400' : 'bg-green-50 border border-green-200',
        text: 'text-green-600'
      }
    : {
        base: isStarred ? 'bg-red-100 border-2 border-red-400' : 'bg-red-50 border border-red-200',
        text: 'text-red-600'
      }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${colorClasses.base}`}
    >
      <div className="flex items-center space-x-2 flex-1">
        <button
          type="button"
          onClick={() => onStar(isStarred ? null : index)}
          className={`text-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
            isStarred 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          title="Mark as most important"
          disabled={!canEdit}
        >
          ⭐
        </button>
        <span className={`text-sm flex-1 ${isStarred ? 'font-medium' : ''}`}>
          {item}
          {isStarred && (
            <span className={`text-xs ${colorClasses.text} ml-2 italic`}>
              This matters most to you
            </span>
          )}
        </span>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}

const ProsConsList: React.FC<ProsConsListProps> = ({
  pros,
  cons,
  currentPro,
  currentCon,
  starredPro,
  starredCon,
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
  const handleProKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddPro()
    }
  }

  const handleConKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddCon()
    }
  }

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
      {/* Pros Section */}
      <div>
        <label className="block text-base sm:text-lg font-semibold mb-3 text-green-700">
          Pros (max 5)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentPro}
            onChange={(e) => onProChange(e.target.value)}
            onKeyDown={handleProKeyDown}
            className="flex-1 px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="e.g., Higher salary"
            maxLength={100}
            autoCapitalize="sentences"
            autoCorrect="on"
            disabled={isTimerActive}
          />
          <Button
            type="button"
            onClick={onAddPro}
            disabled={!currentPro.trim() || pros.length >= 5 || isTimerActive}
            variant="success"
            size="md"
          >
            Add
          </Button>
        </div>
        <AnimatePresence>
          {pros.map((pro, index) => (
            <ProConsItem
              key={index}
              item={pro}
              index={index}
              type="pro"
              isStarred={starredPro === index}
              onStar={onStarPro}
              onRemove={onRemovePro}
              canEdit={!isTimerActive}
            />
          ))}
        </AnimatePresence>
        {pros.length === 0 && (
          <p className="text-gray-400 text-sm italic">No pros added yet. Press Enter or Ctrl+Enter to add.</p>
        )}
      </div>

      {/* Cons Section */}
      <div>
        <label className="block text-base sm:text-lg font-semibold mb-3 text-red-700">
          Cons (max 5)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentCon}
            onChange={(e) => onConChange(e.target.value)}
            onKeyDown={handleConKeyDown}
            className="flex-1 px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            placeholder="e.g., Longer commute"
            maxLength={100}
            autoCapitalize="sentences"
            autoCorrect="on"
            disabled={isTimerActive}
          />
          <Button
            type="button"
            onClick={onAddCon}
            disabled={!currentCon.trim() || cons.length >= 5 || isTimerActive}
            variant="danger"
            size="md"
          >
            Add
          </Button>
        </div>
        <AnimatePresence>
          {cons.map((con, index) => (
            <ProConsItem
              key={index}
              item={con}
              index={index}
              type="con"
              isStarred={starredCon === index}
              onStar={onStarCon}
              onRemove={onRemoveCon}
              canEdit={!isTimerActive}
            />
          ))}
        </AnimatePresence>
        {cons.length === 0 && (
          <p className="text-gray-400 text-sm italic">No cons added yet. Press Enter or Ctrl+Enter to add.</p>
        )}
      </div>
    </div>
  )
}

export default ProsConsList