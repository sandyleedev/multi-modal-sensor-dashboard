'use client'

import React, { useState } from 'react'
import { ControlPanelTypes } from '@/types/control-panel.types'
import { formatDate } from '@/lib/date'

const QUICK_RANGES = [
  { label: '3 Hours', mins: 180 },
  { label: '24 Hours', mins: 1440 },
  { label: '3 Days', mins: 4320 },
  { label: '1 Week', mins: 10080 },
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
}: ControlPanelTypes) {
  const [activeRange, setActiveRange] = useState<number | null>(1440)

  const setQuickRange = (minutes: number) => {
    if (!dbRange.max) return

    setActiveRange(minutes)

    const end = new Date(dbRange.max)
    const start = new Date(end.getTime() - minutes * 60 * 1000)

    setStartTime(formatDate(start))
    setEndTime(formatDate(end))
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
          <div className="mt-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Start</label>
            <input
              type="datetime-local"
              value={startTime}
              min={dbRange.min}
              max={dbRange.max}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-[10px] font-bold text-gray-400 uppercase">End</label>
            <input
              type="datetime-local"
              value={endTime}
              min={dbRange.min}
              max={dbRange.max}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          Apply Filter
        </button>

        {/* 2. Node Selection */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Sensor Node
          </h3>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(Number(e.target.value))}
            className="rounded-md border bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            ∏<option value={1}>Node #1</option>
          </select>
        </section>

        {/* 3. Condition Filters (To be implemented) */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            Condition Filters
          </h3>
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-400">
            Click [+ Add Condition] to start filtering
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            + Add Condition
          </button>
        </section>
      </div>
    </aside>
  )
}
