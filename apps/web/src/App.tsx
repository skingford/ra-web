import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import UseHookExample from './pages/UseHookExample'
import ActionsExample from './pages/ActionsExample'
import OptimisticUpdatesExample from './pages/OptimisticUpdatesExample'
import TransitionsExample from './pages/TransitionsExample'
import ServerComponentsExample from './pages/ServerComponentsExample'
import SuspenseExample from './pages/SuspenseExample'
import ErrorBoundaryExample from './pages/ErrorBoundaryExample'
import RefCleanupExample from './pages/RefCleanupExample'
import ContextProviderExample from './pages/ContextProviderExample'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="use-hook" element={<UseHookExample />} />
          <Route path="actions" element={<ActionsExample />} />
          <Route path="optimistic-updates" element={<OptimisticUpdatesExample />} />
          <Route path="transitions" element={<TransitionsExample />} />
          <Route path="server-components" element={<ServerComponentsExample />} />
          <Route path="suspense" element={<SuspenseExample />} />
          <Route path="error-boundary" element={<ErrorBoundaryExample />} />
          <Route path="ref-cleanup" element={<RefCleanupExample />} />
          <Route path="context-provider" element={<ContextProviderExample />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
