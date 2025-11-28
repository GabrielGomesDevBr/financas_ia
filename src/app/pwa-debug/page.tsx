'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface PWACheck {
  name: string
  status: 'pass' | 'fail' | 'unknown'
  message: string
}

export default function PWADebugPage() {
  const [checks, setChecks] = useState<PWACheck[]>([])
  const [manifestData, setManifestData] = useState<any>(null)

  useEffect(() => {
    const runChecks = async () => {
      const results: PWACheck[] = []

      // Check 1: HTTPS
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      results.push({
        name: 'HTTPS',
        status: isHTTPS ? 'pass' : 'fail',
        message: isHTTPS ? 'Site served over HTTPS ✓' : 'Site must be served over HTTPS'
      })

      // Check 2: Service Worker
      const hasSW = 'serviceWorker' in navigator
      results.push({
        name: 'Service Worker Support',
        status: hasSW ? 'pass' : 'fail',
        message: hasSW ? 'Browser supports Service Workers ✓' : 'Browser does not support Service Workers'
      })

      if (hasSW) {
        const registration = await navigator.serviceWorker.getRegistration()
        results.push({
          name: 'Service Worker Registration',
          status: registration ? 'pass' : 'fail',
          message: registration
            ? `Service Worker registered: ${registration.active?.state || 'installing'} ✓`
            : 'Service Worker not registered'
        })
      }

      // Check 3: Manifest
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
        if (manifestLink) {
          const manifestResponse = await fetch(manifestLink.href)
          const manifest = await manifestResponse.json()
          setManifestData(manifest)

          results.push({
            name: 'Web App Manifest',
            status: 'pass',
            message: 'Manifest found and loaded ✓'
          })

          // Check manifest fields
          const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons']
          requiredFields.forEach(field => {
            const hasField = manifest[field] !== undefined
            results.push({
              name: `Manifest: ${field}`,
              status: hasField ? 'pass' : 'fail',
              message: hasField ? `${field} present ✓` : `${field} missing`
            })
          })

          // Check icons
          const hasValidIcons = manifest.icons && manifest.icons.some((icon: any) => {
            const size = parseInt(icon.sizes?.split('x')[0] || '0')
            return size >= 192
          })
          results.push({
            name: 'Manifest: Icon ≥192px',
            status: hasValidIcons ? 'pass' : 'fail',
            message: hasValidIcons ? 'Has icon ≥192px ✓' : 'No icon ≥192px found'
          })

          // Check display mode
          const validDisplay = ['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)
          results.push({
            name: 'Manifest: Display Mode',
            status: validDisplay ? 'pass' : 'fail',
            message: validDisplay ? `Display: ${manifest.display} ✓` : `Invalid display mode: ${manifest.display}`
          })
        } else {
          results.push({
            name: 'Web App Manifest',
            status: 'fail',
            message: 'Manifest link not found in HTML'
          })
        }
      } catch (error) {
        results.push({
          name: 'Web App Manifest',
          status: 'fail',
          message: `Error loading manifest: ${error}`
        })
      }

      // Check 4: beforeinstallprompt
      let beforeInstallPromptFired = false
      window.addEventListener('beforeinstallprompt', () => {
        beforeInstallPromptFired = true
      })

      setTimeout(() => {
        results.push({
          name: 'beforeinstallprompt Event',
          status: beforeInstallPromptFired ? 'pass' : 'unknown',
          message: beforeInstallPromptFired
            ? 'Event fired - PWA is installable ✓'
            : 'Event not fired yet (may require user engagement)'
        })
        setChecks([...results])
      }, 3000)

      // Check 5: Standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      results.push({
        name: 'Currently Installed',
        status: isStandalone ? 'pass' : 'unknown',
        message: isStandalone ? 'App is running in standalone mode ✓' : 'App running in browser'
      })

      setChecks(results)
    }

    runChecks()
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const passCount = checks.filter(c => c.status === 'pass').length
  const failCount = checks.filter(c => c.status === 'fail').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PWA Diagnóstico</h1>
          <p className="text-gray-600 mb-6">
            Verificação de critérios de instalabilidade Progressive Web App
          </p>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="text-2xl font-bold text-green-700">{passCount}</div>
              <div className="text-sm text-green-600">Passou</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
              <div className="text-2xl font-bold text-red-700">{failCount}</div>
              <div className="text-sm text-red-600">Falhou</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {checks.length - passCount - failCount}
              </div>
              <div className="text-sm text-yellow-600">Desconhecido</div>
            </div>
          </div>

          {/* Checks List */}
          <div className="space-y-3 mb-8">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                  check.status === 'pass'
                    ? 'bg-green-50 border-green-200'
                    : check.status === 'fail'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                {getIcon(check.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{check.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{check.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Manifest Data */}
          {manifestData && (
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Manifest.json</h2>
              <pre className="text-xs bg-white p-4 rounded-lg overflow-auto max-h-96 border border-gray-200">
                {JSON.stringify(manifestData, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-3">Como testar no Chrome</h2>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Abra o Chrome DevTools (F12)</li>
              <li>Vá para a aba "Application"</li>
              <li>Clique em "Manifest" no painel esquerdo</li>
              <li>Verifique se todos os campos estão corretos</li>
              <li>Clique em "Service Workers" e verifique se está ativo</li>
              <li>Na seção "App Manifest", clique em "Add to homescreen" para testar</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
