import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function NatureSectionHeader({
  title, description, icon: Icon, artwork,
}: {
  title: string
  description: string
  icon: LucideIcon
  artwork?: ReactNode
}) {
  return (
    <header className="nature-section-header nature-glass">
      {artwork}
      <div className="nature-section-shade" />
      <div className="nature-section-content">
        <span className="nature-section-icon" aria-hidden="true"><Icon size={23} /></span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  )
}
