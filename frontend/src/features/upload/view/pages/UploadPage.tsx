import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUploadViewModel } from "../../viewModel/useUploadViewModel";
import type { UploadActionResult } from "../../viewModel/UploadViewModel";
import { ImageUploadPanel } from "../components/ImageUploadPanel";
import { MarkdownUploadPanel } from "../components/MarkdownUploadPanel";
import { PdfUploadPanel } from "../components/PdfUploadPanel";
import { UploadSteps } from "../components/UploadSteps";
import { UploadTabs } from "../components/UploadTabs";
import { UrlUploadPanel } from "../components/UrlUploadPanel";

function showActionResult(result: UploadActionResult) {
  if (result.message) toast.success(result.message);
  if (result.errorMessage) toast.error(result.errorMessage);
}

export function UploadPage() {
  const viewModel = useUploadViewModel();

  const uploadPdf = async () => {
    showActionResult(await viewModel.uploadSelectedPdf());
  };

  const uploadMarkdown = async () => {
    showActionResult(await viewModel.uploadSelectedMarkdown());
  };

  const ingestUrls = async () => {
    showActionResult(await viewModel.ingestUrls());
  };

  const handleAsyncFileResult = async (result: Promise<UploadActionResult>) => {
    showActionResult(await result);
  };

  const saveImage = async () => {
    showActionResult(await viewModel.saveSelectedImage());
  };

  return (
    <div className="min-h-screen bg-rm-trip-surface">
      <PageHeader
        title="Add Content"
        subtitle="Upload documents, web pages, and images your assistant can use."
      />
      <div className="px-4 py-8 sm:px-8">
        <UploadTabs activeTab={viewModel.activeTab} onChange={viewModel.setActiveTab} />

        <div className="bg-white rounded-rm-trip-smooth shadow-rm-trip-card border border-gray-100 overflow-hidden">
          {viewModel.activeTab === "pdf" && (
            <PdfUploadPanel viewModel={viewModel} onUpload={() => void uploadPdf()} onFileResult={showActionResult} />
          )}
          {viewModel.activeTab === "markdown" && (
            <MarkdownUploadPanel
              viewModel={viewModel}
              onUpload={() => void uploadMarkdown()}
              onFileResult={showActionResult}
            />
          )}
          {viewModel.activeTab === "url" && <UrlUploadPanel viewModel={viewModel} onIngest={() => void ingestUrls()} />}
          {viewModel.activeTab === "image" && (
            <ImageUploadPanel
              viewModel={viewModel}
              onSave={() => void saveImage()}
              onFileResult={(result) => void handleAsyncFileResult(result)}
            />
          )}
        </div>

        <UploadSteps />
      </div>
    </div>
  );
}
