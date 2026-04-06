import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import AreasPage from '@/pages/AreasPage'
import AreaTreePage from '@/pages/AreaTreePage'
import ProcessesPage from '@/pages/ProcessesPage'
import ProcessDetailPage from '@/pages/ProcessDetailPage'
import ToolsPage from '@/pages/ToolsPage'
import ResponsiblesPage from '@/pages/ResponsiblesPage'
import DocumentsPage from '@/pages/DocumentsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ChangelogPage from '@/pages/ChangelogPage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'areas', element: <AreasPage /> },
      { path: 'areas/:id', element: <AreaTreePage /> },
      { path: 'processes', element: <ProcessesPage /> },
      { path: 'processes/:id', element: <ProcessDetailPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'responsibles', element: <ResponsiblesPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'changelog', element: <ChangelogPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>,
)
