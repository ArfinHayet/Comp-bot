import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Plus, Trash2, Globe, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  listWidgetKeys,
  createWidgetKey,
  deleteWidgetKey,
  listAllowedDomains,
  createAllowedDomain,
  deleteAllowedDomain,
  type WidgetKeyItem,
  type AllowedDomainItem,
} from '@/lib/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function EmbedPage() {
  const [keys, setKeys] = useState<WidgetKeyItem[]>([])
  const [domains, setDomains] = useState<AllowedDomainItem[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newDomain, setNewDomain] = useState('')
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [loadingDomains, setLoadingDomains] = useState(true)

  useEffect(() => {
    listWidgetKeys()
      .then(setKeys)
      .catch(() => toast.error('Failed to load widget keys'))
      .finally(() => setLoadingKeys(false))

    listAllowedDomains()
      .then(setDomains)
      .catch(() => toast.error('Failed to load allowed domains'))
      .finally(() => setLoadingDomains(false))
  }, [])

  // ── Widget Keys ──────────────────────────────────────────────────────────────

  const handleCreateKey = async () => {
    const label = newLabel.trim() || 'My Widget'
    try {
      const created = await createWidgetKey(label)
      setKeys((prev) => [created, ...prev])
      setNewLabel('')
      toast.success('Widget key created')
    } catch {
      toast.error('Failed to create widget key')
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteWidgetKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast.success('Widget key deleted')
    } catch {
      toast.error('Failed to delete widget key')
    }
  }

  const copySnippet = (key: string) => {
    const snippet = `<script src="${API_URL}/widget.js" data-key="${key}" data-api="${API_URL}"></script>`
    navigator.clipboard.writeText(snippet).then(
      () => toast.success('Snippet copied to clipboard'),
      () => toast.error('Failed to copy'),
    )
  }

  // ── Allowed Domains ──────────────────────────────────────────────────────────

  const handleCreateDomain = async () => {
    const domain = newDomain.trim()
    if (!domain) return
    try {
      const created = await createAllowedDomain(domain)
      setDomains((prev) => [created, ...prev])
      setNewDomain('')
      toast.success('Domain added')
    } catch {
      toast.error('Failed to add domain')
    }
  }

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteAllowedDomain(id)
      setDomains((prev) => prev.filter((d) => d.id !== id))
      toast.success('Domain removed')
    } catch {
      toast.error('Failed to remove domain')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Embed Widget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a widget key and whitelist your domains to embed the chat widget on external sites.
          Localhost is always allowed for development.
        </p>
      </div>

      {/* Widget Keys Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Widget Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Label (e.g. My Website)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
              className="flex-1"
            />
            <Button onClick={handleCreateKey}>
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>

          {loadingKeys ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No widget keys yet. Create one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[90px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.label}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{k.key}</code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Copy embed snippet"
                          onClick={() => copySnippet(k.key)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete key"
                          onClick={() => handleDeleteKey(k.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {keys.length > 0 && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium mb-1.5">Embed snippet (click copy icon on any key):</p>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                {`<script src="${API_URL}/widget.js"\n  data-key="YOUR_KEY"\n  data-api="${API_URL}">\n</script>`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allowed Domains Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Allowed Domains
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add the exact origin of each site that may embed your widget (e.g.{' '}
            <code className="text-xs bg-muted px-1 rounded">https://example.com</code>).
            Localhost is always allowed automatically.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDomain()}
              className="flex-1"
            />
            <Button onClick={handleCreateDomain}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {loadingDomains ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domains whitelisted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.domain}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDomain(d.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
