'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Key, Plus, Trash2, Ban, Copy, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { ApiKeyListItem } from '@/features/api-keys/types'
import { format } from 'date-fns'

interface ApiKeysManagerProps {
  readonly initialKeys: ApiKeyListItem[]
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeyListItem[]>(initialKeys)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setIsCreating(true)

    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to create key')
        return
      }

      const { key, rawKey } = await res.json()
      setKeys((prev) => [key, ...prev])
      setRevealedKey(rawKey)
      setNewKeyName('')
    } catch {
      toast.error('Failed to create key')
    } finally {
      setIsCreating(false)
    }
  }

  function handleDialogClose() {
    setRevealedKey(null)
    setCopied(false)
    setDialogOpen(false)
    setNewKeyName('')
  }

  async function handleCopy() {
    if (!revealedKey) return
    await navigator.clipboard.writeText(revealedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevoke(id: string) {
    setPendingId(id)
    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'PATCH' })
      if (!res.ok) {
        toast.error('Failed to revoke key')
        return
      }
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, is_active: false } : k))
      )
      toast.success('Key revoked')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id)
    try {
      const res = await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Failed to delete key')
        return
      }
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast.success('Key deleted')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-8">
      
      <Card className="developer-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-secondary shadow-[2px_2px_0_0_#000]">
              <Key className="icon-on-color h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">API Keys</h2>
              <p className="text-xs text-muted-foreground">{keys.length} key{keys.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            variant="secondary"
            className="developer-primary-btn"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Generate New Key
          </Button>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Key className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-muted-foreground">No API keys yet. Generate one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Key</th>
                  <th className="text-left pb-2 font-medium">Created</th>
                  <th className="text-left pb-2 font-medium">Last Used</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-right pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {keys.map((key) => (
                  <tr key={key.id} className="py-3">
                    <td className="py-3 pr-4 font-medium text-gray-900">{key.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{key.key_preview}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {key.created_at ? format(new Date(key.created_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {key.last_used_at ? format(new Date(key.last_used_at), 'MMM d, yyyy') : 'Never'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={key.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {key.is_active ? 'Active' : 'Revoked'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(key.id)}
                            disabled={pendingId === key.id}
                            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(key.id)}
                          disabled={pendingId === key.id}
                          className="h-7 border-2 border-black bg-accent px-2 text-xs text-black hover:bg-primary hover:text-white"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleDialogClose() }}>
        <DialogContent className="developer-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Give your key a descriptive name so you know where it&apos;s used.
            </DialogDescription>
          </DialogHeader>

          {revealedKey ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 border-2 border-black bg-accent p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-black" />
                <p className="text-xs text-black">
                  This key will only be shown once. Copy it now — you won&apos;t be able to see it again.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Your API Key</Label>
                <div className="flex gap-2">
                  <code className="flex-1 border-2 border-black bg-white px-3 py-2 text-xs font-mono break-all">
                    {revealedKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="developer-outline-btn shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDialogClose} variant="secondary" className="developer-primary-btn">
                  I&apos;ve copied my key
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  className="developer-input"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. n8n workflow, Postman test"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" className="developer-outline-btn" onClick={handleDialogClose}>Cancel</Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newKeyName.trim()}
                  variant="secondary"
                  className="developer-primary-btn"
                >
                  {isCreating ? 'Generating…' : 'Generate Key'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
