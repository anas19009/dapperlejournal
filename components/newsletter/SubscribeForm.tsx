'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export function SubscribeForm() {
  const [subscribed, setSubscribed] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json().catch(() => null)
      if (json?.success) {
        setSubscribed(true)
        toast.success(json.message)
      } else {
        toast.error(json?.message ?? 'Something went wrong')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  if (subscribed) {
    return (
      <div className="mx-auto mt-12 max-w-lg border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
        <p className="text-lg font-semibold">You&apos;re subscribed!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll get an email when the next post is published.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-12 max-w-lg border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
      <p className="mb-2 inline-block border-2 border-black bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest">Newsletter</p>
      <h2 className="mb-1 text-xl font-bold">Stay in the loop</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Get notified when new posts are published. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-sm gap-2">
        <label htmlFor="subscribe-email" className="sr-only">Email address</label>
        <Input
          {...register('email')}
          id="subscribe-email"
          type="email"
          placeholder="your@email.com"
          className="flex-1 border-2 border-black"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting} className="shadow-shadow">
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {errors.email && (
        <p className="mt-2 text-xs text-destructive">{errors.email.message}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">No spam · Unsubscribe anytime</p>
    </div>
  )
}
