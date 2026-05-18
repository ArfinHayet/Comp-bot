/* eslint-disable react-hooks/refs */
import { CheckCircle2, ImageUp, Loader2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUploadViewModel } from "@/features/upload/viewModel/useUploadViewModel";

export function ImageUploadPage() {
  const vm = useUploadViewModel();

  const save = async () => {
    const result = await vm.saveSelectedImage();
    if (result.message) toast.success(result.message);
    if (result.errorMessage) toast.error(result.errorMessage);
  };

  return (
    <div className="min-h-screen bg-rm-trip-surface">
      <PageHeader title="Upload Image" subtitle="AI auto-generates title and description which you can edit before saving." />
      <div className="max-w-2xl p-8">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div
              className={cn(
                "cursor-pointer select-none rounded-lg border-2 border-dashed p-10 text-center transition-colors",
                vm.imgDragging ? "border-primary bg-accent" : "border-muted-foreground/30 hover:border-primary/60",
                vm.selectedImg && "border-primary/60 bg-accent/40",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                vm.setImgDragging(true);
              }}
              onDragLeave={() => vm.setImgDragging(false)}
              onDrop={(event) => void vm.handleImgDrop(event).then(showResult)}
              onClick={() => (vm.imgState === "idle" || vm.imgState === "error" ? vm.imgInputRef.current?.click() : undefined)}
            >
              <input ref={vm.imgInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void vm.handleImgChange(event).then(showResult)} />
              {vm.imgPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={vm.imgPreview} alt="Preview" className="mx-auto max-h-48 rounded-lg object-contain" />
                  <p className="text-sm text-muted-foreground">{vm.selectedImg?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageUp className="h-10 w-10" />
                  <p className="font-medium">Drop an image here or click to browse</p>
                  <p className="text-sm">PNG, JPG, WEBP - max 10 MB</p>
                </div>
              )}
            </div>

            {vm.imgState === "analyzing" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing image and preparing metadata...
              </div>
            )}

            {(vm.imgState === "ready" || vm.imgState === "saving" || vm.imgState === "success") && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={vm.imgTitle} onChange={(event) => vm.setImgTitle(event.target.value)} disabled={vm.imgState === "saving" || vm.imgState === "success"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={vm.imgDesc} onChange={(event) => vm.setImgDesc(event.target.value)} rows={4} disabled={vm.imgState === "saving" || vm.imgState === "success"} />
                </div>
              </div>
            )}

            {vm.imgState === "success" && vm.imgResult && (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-800">{vm.imgResult.title}</p>
                  <p className="text-sm text-emerald-700">Saved - ID: {vm.imgResult.id.slice(0, 8)}...</p>
                </div>
              </div>
            )}

            {vm.imgState === "error" && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">Something went wrong. See toast for details.</p>
              </div>
            )}

            <div className="flex gap-2">
              {vm.imgState === "ready" && (
                <Button onClick={() => void save()} disabled={!vm.imgTitle.trim() || !vm.imgDesc.trim()} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save to Knowledge Base
                </Button>
              )}
              {vm.imgState === "saving" && (
                <Button disabled className="gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </Button>
              )}
              {(vm.selectedImg || vm.imgState !== "idle") && (
                <Button variant="outline" onClick={vm.resetImage}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">What happens after saving?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>Image binary is uploaded to storage</li>
              <li>Title and description are indexed for semantic search</li>
              <li>Record details and storage URL are saved in the database</li>
              <li>The Chat page can answer questions about this image content</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function showResult(result: { errorMessage?: string }) {
  if (result.errorMessage) toast.error(result.errorMessage);
}
