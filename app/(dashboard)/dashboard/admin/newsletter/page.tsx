import type { Metadata } from 'next'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { requirePermission } from '@/lib/auth/session'
import {
  getSubscriberStats,
  getScheduledSends,
  getRecentSubscribers,
} from '@/features/newsletter/queries'

export const metadata: Metadata = { title: 'Newsletter' }

export default async function NewsletterPage() {
  await requirePermission('users:read')

  let stats = { active: 0, sends_dispatched: 0, unsubscribed: 0 }
  let scheduledSends: Awaited<ReturnType<typeof getScheduledSends>> = []
  let recentSubscribers: Awaited<ReturnType<typeof getRecentSubscribers>> = []
  let loadError: string | null = null

  try {
    ;[stats, scheduledSends, recentSubscribers] = await Promise.all([
      getSubscriberStats(),
      getScheduledSends(),
      getRecentSubscribers(20),
    ])
  } catch (error) {
    console.error('[newsletter] Failed to load data', error)
    loadError = 'Newsletter tables are not available. Apply the newsletter database migration, then refresh this page.'
  }

  return (
    <div className="newsletter-settings p-4 md:p-8 space-y-6 animate-page">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage subscribers and scheduled sends
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Subscribers" value={stats.active} />
        <StatCard label="Sends Dispatched" value={stats.sends_dispatched} />
        <StatCard label="Unsubscribed" value={stats.unsubscribed} />
      </div>

      {loadError && (
        <div className="newsletter-error border-2 border-black p-4 text-sm">
          <p className="font-bold">Unable to load newsletter data</p>
          <p className="mt-1">{loadError}</p>
        </div>
      )}

      {scheduledSends.length > 0 && (
        <div className="newsletter-panel border-2 border-black bg-white shadow-shadow">
          <div className="newsletter-panel-header px-4 py-3 border-b-2 border-black font-semibold text-sm">Scheduled Sends</div>
          <div className="divide-y">
            {scheduledSends.map((send) => (
              <div key={send.id} className="newsletter-row px-4 py-3 flex items-center justify-between text-sm">
                <span className="font-medium truncate mr-4">{send.post_title}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground text-xs">
                    {new Date(send.scheduled_at) > new Date()
                      ? `Sends in ${formatDistanceToNow(new Date(send.scheduled_at))}`
                      : 'Processing...'}
                  </span>
                  <StatusBadge status={send.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="newsletter-panel border-2 border-black bg-white shadow-shadow">
        <div className="newsletter-panel-header px-4 py-3 border-b-2 border-black font-semibold text-sm flex items-center justify-between">
          <span>Subscribers</span>
          <Link
            href="/api/newsletter/subscribers/export"
            className="newsletter-export-btn text-xs transition-colors"
          >
            Export CSV
          </Link>
        </div>
        {recentSubscribers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">No subscribers yet.</p>
        ) : (
          <div className="divide-y">
            {recentSubscribers.map((sub) => (
              <div key={sub.id} className="newsletter-row px-4 py-3 flex items-center justify-between text-sm">
                <span>{sub.email}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(sub.subscribed_at), 'MMM d, yyyy')}
                  </span>
                  <StatusBadge status={sub.unsubscribed_at ? 'unsubscribed' : 'active'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="newsletter-stat newsletter-panel border-2 border-black bg-white p-4 text-center shadow-shadow">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

const statusClasses: Record<string, string> = {
  active: 'border-2 border-black bg-black text-white',
  pending: 'border-2 border-black bg-white text-black',
  sending: 'border-2 border-black bg-black text-white',
  sent: 'border-2 border-black bg-black text-white',
  failed: 'border-2 border-black bg-black text-white',
  unsubscribed: 'border-2 border-black bg-black text-white',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`newsletter-status inline-flex items-center px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0_0_#000] ${statusClasses[status] ?? ''}`}
    >
      {status}
    </span>
  )
}
