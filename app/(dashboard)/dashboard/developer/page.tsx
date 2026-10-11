import type { Metadata } from 'next'
import { listApiKeys } from '@/features/api-keys/apiKeyService'
import { ApiKeysManager } from './ApiKeysManager'
import { LLMProvidersManager } from '@/components/ai-assistant/LLMProvidersManager'
import { ApiReferenceSection } from '@/components/developer/ApiReferenceSection'
import { requirePermission } from '@/lib/auth/session'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = { title: 'Developer Settings' }

export default async function DeveloperPage() {
  const profile = await requirePermission('api_keys:write')

  let keys: Awaited<ReturnType<typeof listApiKeys>> = []
  try {
    keys = await listApiKeys(profile.id)
  } catch (error) {
    console.error('[developer] Failed to load API keys', error)
  }

  return (
    <div className="developer-settings p-4 md:p-8 space-y-6 animate-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage API keys and LLM providers for your account
        </p>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="llm-providers">LLM Providers</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="mt-6">
          <ApiKeysManager initialKeys={keys} />
        </TabsContent>

        <TabsContent value="llm-providers" className="mt-6">
          <LLMProvidersManager />
        </TabsContent>

        <TabsContent value="api-reference" className="mt-6">
          <ApiReferenceSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
