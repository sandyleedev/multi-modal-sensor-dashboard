interface ChartWrapperProps {
  title: string
  height?: string
  children: React.ReactNode
}

export default function ChartWrapper({ title, height = '300px', children }: ChartWrapperProps) {
  return (
    <div style={{ height }} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">{title}</h3>
      <div className="relative h-[calc(100%-2rem)]">{children}</div>
    </div>
  )
}
