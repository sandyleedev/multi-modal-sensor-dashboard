'use client'

import React, { useState } from 'react'
import { ControlPanelTypes } from '@/types/control-panel.types'
import { formatDate } from '@/lib/date'
import { FilterCondition } from '@/types/filter.types'

const QUICK_RANGES = [
  { label: '3 Hours', mins: 180 },
  { label: '24 Hours', mins: 1440 },
  { label: '3 Days', mins: 4320 },
  { label: '1 Week', mins: 10080 },
]

const FILTER_COLUMNS = [
  { label: 'Temperature', value: 'temp' },
  { label: 'Humidity', value: 'humid' },
  { label: 'Brightness', value: 'bright' },
  { label: 'Sound Level', value: 'soundlevel' },
  { label: 'Motion (PIR)', value: 'pir' },
]

const FILTER_OPERATORS = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' },
]

export default function ControlPanel({
  selectedNode,
  setSelectedNode,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onSearch,
  dbRange,
  filters,
  setFilters,
}: ControlPanelTypes) {
  const [activeRange, setActiveRange] = useState<number | null>(1440)
  const [isAdding, setIsAdding] = useState(false)
  const [newFilter, setNewFilter] = useState<FilterCondition>({
    column: 'temp',
    operator: '>',
    value: 25,
  })

  // Validation check - ensure that startTime is earlier than endTime
  const isTimeInvalid = startTime && endTime && new Date(startTime) > new Date(endTime)

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setActiveRange(null)
    if (type === 'start') {
      setStartTime(value)
      // automatically sync end time with the new start time to maintain validity
      if (endTime && new Date(value) > new Date(endTime)) {
        setEndTime(value)
      }
    } else {
      setEndTime(value)
    }
  }

  const setQuickRange = (minutes: number) => {
    if (!dbRange.max) return

    setActiveRange(minutes)

    const end = new Date(dbRange.max)
    const start = new Date(end.getTime() - minutes * 60 * 1000)

    setStartTime(formatDate(start))
    setEndTime(formatDate(end))
  }

  const addFilter = () => {
    setFilters([...filters, newFilter])
    setIsAdding(false)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  return (
    <aside className="border-gray h-full w-[30%] min-w-[320px] overflow-y-auto border-r border-gray-300 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-8">
        {/* Title */}
        <section>
          <h2 className="text-xl font-bold text-gray-800">Data Explorer</h2>
          <p className="mt-1 text-sm text-gray-500">Configure your dashboard view</p>
        </section>

        {/* 1. Time Range Selector */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Time Range
          </h3>

          {/* quick time range */}
          <div className="flex gap-2">
            {QUICK_RANGES.map((range) => {
              const isActive = activeRange === range.mins
              return (
                <button
                  key={range.label}
                  onClick={() => setQuickRange(range.mins)}
                  className={`${
                    isActive
                      ? 'border-blue-500 bg-blue-500 text-white' // active style
                      : 'border-gray-400 bg-white text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500' // default style
                  } cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors`}
                >
                  {range.label}
                </button>
              )
            })}
          </div>

          {/* manual time range input */}
          <div className="mt-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Start</label>
            <input
              type="datetime-local"
              value={startTime}
              min={dbRange.min}
              max={dbRange.max}
              onChange={(e) => handleTimeChange('start', e.target.value)}
              className="w-full cursor-pointer rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-[10px] font-bold text-gray-400 uppercase">End</label>
            <input
              type="datetime-local"
              value={endTime}
              min={startTime}
              max={dbRange.max}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              className="w-full cursor-pointer rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isTimeInvalid && (
              <p className="mt-1 text-[12px] font-bold text-red-500">
                End time cannot be earlier than start time.
              </p>
            )}
          </div>
        </section>

        {/* 2. Node Selection */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Sensor Node
          </h3>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(Number(e.target.value))}
            className="cursor-pointer rounded-md border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Node #1</option>
          </select>
        </section>

        {/* 3. Condition Filters */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Condition Filters
          </h3>

          {/* List of Applied Filters */}
          <div className="flex flex-col gap-2">
            {filters.length === 0 && !isAdding && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-400">
                Click [+ Add Condition] to start filtering
              </div>
            )}

            {filters.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700"
              >
                <span className="font-medium">
                  {f.column} {f.operator} {f.value}
                </span>
                <button
                  onClick={() => removeFilter(idx)}
                  className="cursor-pointer text-blue-400 hover:text-blue-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Filter Entry Form (Visible only when adding) */}
          {isAdding ? (
            <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-3 shadow-inner">
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded border bg-white p-1 text-xs"
                  value={newFilter.column}
                  onChange={(e) => setNewFilter({ ...newFilter, column: e.target.value as any })}
                >
                  {FILTER_COLUMNS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-16 rounded border bg-white p-1 text-xs"
                  value={newFilter.operator}
                  onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as any })}
                >
                  {FILTER_OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                className="rounded border bg-white p-1 text-xs"
                value={newFilter.value}
                onChange={(e) => setNewFilter({ ...newFilter, value: Number(e.target.value) })}
              />
              <div className="mt-1 flex gap-2">
                <button
                  onClick={addFilter}
                  className="flex-1 cursor-pointer rounded bg-blue-600 py-1 text-xs font-bold text-white"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 cursor-pointer rounded bg-gray-400 py-1 text-xs font-bold text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="cursor-pointer text-left text-sm font-medium text-blue-600 hover:underline"
            >
              + Add Condition
            </button>
          )}
        </section>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          Apply Filter
        </button>
      </div>
    </aside>
  )
}
