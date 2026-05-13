import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, Trash2, Globe, Key, Code2 } from "lucide-react";
import {
  listWidgetKeys,
  createWidgetKey,
  deleteWidgetKey,
  listAllowedDomains,
  createAllowedDomain,
  deleteAllowedDomain,
  type WidgetKeyItem,
  type AllowedDomainItem,
} from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function EmbedPage() {
  const [keys, setKeys] = useState<WidgetKeyItem[]>([]);
  const [domains, setDomains] = useState<AllowedDomainItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingDomains, setLoadingDomains] = useState(true);

  useEffect(() => {
    listWidgetKeys()
      .then(setKeys)
      .catch(() => toast.error("Failed to load widget keys"))
      .finally(() => setLoadingKeys(false));
    listAllowedDomains()
      .then(setDomains)
      .catch(() => toast.error("Failed to load allowed domains"))
      .finally(() => setLoadingDomains(false));
  }, []);

  const handleCreateKey = async () => {
    const label = newLabel.trim() || "My Widget";
    try {
      const created = await createWidgetKey(label);
      setKeys((prev) => [created, ...prev]);
      setNewLabel("");
      toast.success("Widget key created");
    } catch {
      toast.error("Failed to create widget key");
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteWidgetKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Widget key deleted");
    } catch {
      toast.error("Failed to delete widget key");
    }
  };

  const copySnippet = (key: string) => {
    const snippet = `<script src="${API_URL}/widget.js" data-key="${key}" data-api="${API_URL}"></script>`;
    navigator.clipboard.writeText(snippet).then(
      () => toast.success("Snippet copied to clipboard"),
      () => toast.error("Failed to copy"),
    );
  };

  const handleCreateDomain = async () => {
    const domain = newDomain.trim();
    if (!domain) return;
    try {
      const created = await createAllowedDomain(domain);
      setDomains((prev) => [created, ...prev]);
      setNewDomain("");
      toast.success("Domain added");
    } catch {
      toast.error("Failed to add domain");
    }
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      await deleteAllowedDomain(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      toast.success("Domain removed");
    } catch {
      toast.error("Failed to remove domain");
    }
  };

  return (
    <div className="min-h-screen bg-rm-trip-surface px-4 py-10 sm:px-8">
      <div className="mx-auto space-y-6">
        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-rm-trip-brand/10 text-rm-trip-brand text-xs font-semibold px-3 py-1 rounded-rm-trip-pill mb-3 uppercase tracking-wider">
            Embed
          </div>
          <h1 className="font-rm-trip-heading text-rm-trip-h2 font-bold text-rm-trip-text mb-2">Widget Settings</h1>
          <p className="text-rm-trip-text-muted text-rm-trip-body-sm leading-relaxed">
            Generate a widget key and whitelist your domains to embed the chat widget on external sites. Localhost is
            always allowed for development.
          </p>
        </div>

        {/* ── Widget Keys ── */}
        <div className="bg-white rounded-rm-trip-smooth shadow-rm-trip-card border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rm-trip-brand/10 flex items-center justify-center">
              <Key className="h-3.5 w-3.5 text-rm-trip-brand" />
            </div>
            <h2 className="font-rm-trip-heading font-semibold text-rm-trip-text text-sm">Widget Keys</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Create row */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Label (e.g. My Website)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-rm-trip-smooth text-sm text-rm-trip-text placeholder:text-gray-400 focus-rm-trip-highlight bg-gray-50 focus:bg-white transition-colors duration-150 outline-none"
              />
              <button
                onClick={handleCreateKey}
                className="flex items-center gap-1.5 bg-rm-trip-brand hover:bg-rm-trip-brand-dark text-white font-semibold py-2.5 px-4 rounded-rm-trip-smooth shadow-rm-trip-card transition-all duration-150 text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Create
              </button>
            </div>

            {/* Table */}
            {loadingKeys ? (
              <p className="text-sm text-rm-trip-text-muted">Loading…</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-rm-trip-text-muted">No widget keys yet. Create one above.</p>
            ) : (
              <div className="rounded-rm-trip-smooth border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-rm-trip-text-muted uppercase tracking-wide">
                        Label
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-rm-trip-text-muted uppercase tracking-wide">
                        Key
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-rm-trip-text-muted uppercase tracking-wide">
                        Created
                      </th>
                      <th className="w-20 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((k, i) => (
                      <tr key={k.id} className={i !== keys.length - 1 ? "border-b border-gray-50" : ""}>
                        <td className="px-4 py-3 font-medium text-rm-trip-text text-sm">{k.label}</td>
                        <td className="px-4 py-3">
                          <code className="text-xs bg-rm-trip-brand/8 text-rm-trip-brand px-2 py-0.5 rounded-md font-mono">
                            {k.key}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-xs text-rm-trip-text-muted">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              title="Copy embed snippet"
                              onClick={() => copySnippet(k.key)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-rm-trip-text-muted hover:text-rm-trip-brand hover:bg-rm-trip-brand/8 transition-all duration-150"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Delete key"
                              onClick={() => handleDeleteKey(k.id)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-rm-trip-text-muted hover:text-rm-trip-state-error hover:bg-red-50 transition-all duration-150"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Snippet preview */}
            {keys.length > 0 && (
              <div className="rounded-rm-trip-smooth bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Code2 className="h-3.5 w-3.5 text-rm-trip-text-muted" />
                  <p className="text-xs font-semibold text-rm-trip-text-muted">
                    Embed snippet — click the copy icon on any key
                  </p>
                </div>
                <pre className="text-xs text-rm-trip-text font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {`<script src="${API_URL}/widget.js"\n  data-key="YOUR_KEY"\n  data-api="${API_URL}">\n</script>`}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Allowed Domains ── */}
        <div className="bg-white rounded-rm-trip-smooth shadow-rm-trip-card border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rm-trip-brand/10 flex items-center justify-center">
              <Globe className="h-3.5 w-3.5 text-rm-trip-brand" />
            </div>
            <h2 className="font-rm-trip-heading font-semibold text-rm-trip-text text-sm">Allowed Domains</h2>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-sm text-rm-trip-text-muted leading-relaxed">
              Add the exact origin of each site that may embed your widget (e.g.{" "}
              <code className="text-xs bg-rm-trip-brand/8 text-rm-trip-brand px-1.5 py-0.5 rounded-md font-mono">
                https://example.com
              </code>
              ). Localhost is always allowed automatically.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateDomain()}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-rm-trip-smooth text-sm text-rm-trip-text placeholder:text-gray-400 focus-rm-trip-highlight bg-gray-50 focus:bg-white transition-colors duration-150 outline-none"
              />
              <button
                onClick={handleCreateDomain}
                className="flex items-center gap-1.5 bg-rm-trip-brand hover:bg-rm-trip-brand-dark text-white font-semibold py-2.5 px-4 rounded-rm-trip-smooth shadow-rm-trip-card transition-all duration-150 text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            {loadingDomains ? (
              <p className="text-sm text-rm-trip-text-muted">Loading…</p>
            ) : domains.length === 0 ? (
              <p className="text-sm text-rm-trip-text-muted">No domains whitelisted yet.</p>
            ) : (
              <div className="rounded-rm-trip-smooth border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-rm-trip-text-muted uppercase tracking-wide">
                        Domain
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-rm-trip-text-muted uppercase tracking-wide">
                        Added
                      </th>
                      <th className="w-12 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((d, i) => (
                      <tr key={d.id} className={i !== domains.length - 1 ? "border-b border-gray-50" : ""}>
                        <td className="px-4 py-3 text-rm-trip-text font-medium text-sm">{d.domain}</td>
                        <td className="px-4 py-3 text-xs text-rm-trip-text-muted">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeleteDomain(d.id)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-rm-trip-text-muted hover:text-rm-trip-state-error hover:bg-red-50 transition-all duration-150"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
