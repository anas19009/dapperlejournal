'use client'

import { Mascot } from 'page-mascot'

interface DashboardMascotProps {
  readonly size?: number
}

export function DashboardMascot({ size = 72 }: DashboardMascotProps) {
  return (
    <Mascot
      directions="/mascots/kamran-directions.png"
      reactions="/mascots/kamran-reactions.png"
      size={size}
      label="Kamran dashboard mascot"
      className="dashboard-mascot self-center"
    />
  )
}