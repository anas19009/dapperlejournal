'use client'

import { Mascot } from 'page-mascot'

export function PublicMascot({ size = 44 }: { readonly size?: number }) {
  return (
    <Mascot
      directions="/mascots/kamran-directions.png"
      reactions="/mascots/kamran-reactions.png"
      size={size}
      label="Kamran mascot"
      className="public-mascot"
    />
  )
}