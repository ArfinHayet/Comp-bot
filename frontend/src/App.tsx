import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PrivateRoute } from './components/PrivateRoute'
import { isLoggedIn } from './lib/auth'
import { UploadPage } from '@/features/upload'
import { PdfsPage } from '@/features/pdfs'
import { ChatPage } from '@/features/chat'
import { ProfilePage } from '@/features/profile'
import { ChatHistoryPage } from '@/features/chatHistory'
import { CompanyPage } from '@/features/company'
import { LoginPage } from '@/features/auth'
import { SignupPage } from '@/features/auth'
import { AuthCallbackPage } from '@/features/authCallback'
import { EmbedPage } from '@/features/embed'
import { ImageUploadPage, ImagesPage } from '@/features/images'
import { WebPagesPage } from '@/features/webPages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected routes — inside sidebar layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={isLoggedIn() ? '/chat' : '/login'} replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/pdfs" element={<PdfsPage />} />
            <Route path="/web-pages" element={<WebPagesPage />} />
            <Route path="/images/upload" element={<ImageUploadPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/embed" element={<EmbedPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

