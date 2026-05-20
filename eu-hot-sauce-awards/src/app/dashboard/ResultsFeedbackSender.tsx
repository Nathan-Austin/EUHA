'use client'

import { useState, useEffect } from 'react'
import {
  getResultsFeedbackRecipients,
  sendTestResultsFeedback,
  type ResultsRecipient,
} from '@/app/actions'

export default function ResultsFeedbackSender() {
  const [recipients, setRecipients] = useState<ResultsRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Batch send state
  const [sending, setSending] = useState(false)

  // Test state
  const [testSending, setTestSending] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [targetSupplierEmail, setTargetSupplierEmail] = useState('')

  useEffect(() => {
    loadRecipients()
  }, [])

  async function loadRecipients() {
    setLoading(true)
    try {
      const result = await getResultsFeedbackRecipients()
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to load recipients' })
      } else {
        setRecipients(result.recipients || [])
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!confirm(`Send results feedback to ${pendingCount} suppliers? The send runs server-side — you can close this tab and it will continue.`)) return

    setSending(true)
    setMessage(null)

    try {
      const res = await fetch('/api/results-email-worker', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'Failed to start send job' })
        setSending(false)
        return
      }
      setMessage({ type: 'success', text: 'Send job started server-side. Progress updates every 10s.' })
      startPolling()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
      setSending(false)
    }
  }

  function startPolling() {
    const interval = setInterval(async () => {
      const result = await getResultsFeedbackRecipients()
      if (!('error' in result)) {
        setRecipients(result.recipients || [])
        const stillPending = (result.recipients || []).filter((r: any) => !r.alreadySent).length
        if (stillPending === 0) {
          clearInterval(interval)
          setSending(false)
          setMessage({ type: 'success', text: 'All done! All emails sent.' })
        }
      }
    }, 10000)
  }

  function handleStop() {
    setSending(false)
    setMessage({ type: 'error', text: 'Stopped polling — send job may still be running server-side.' })
  }

  async function handleSendTest() {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' })
      return
    }
    if (!targetSupplierEmail) {
      setMessage({ type: 'error', text: 'Please enter a supplier email to preview data from' })
      return
    }
    setTestSending(true)
    setMessage(null)
    try {
      const result = await sendTestResultsFeedback(testEmail, targetSupplierEmail)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' })
      } else {
        setMessage({ type: 'success', text: result.message || 'Test email sent!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setTestSending(false)
    }
  }

  const alreadySentCount = recipients.filter(r => r.alreadySent).length
  const pendingCount = recipients.length - alreadySentCount
  const medalWinnerCount = recipients.filter(r => r.medalCount > 0).length

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading recipients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Results Feedback 2026</h3>
        <p className="text-sm text-gray-600">
          Send each supplier their personalised judging scores, judge comments, and award sticker
          attachments. One email per supplier covering all their sauces. Runs entirely server-side —
          safe to close this tab once started.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Send progress */}
      {sending && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">Sending server-side…</p>
              <p className="text-sm text-blue-700">{alreadySentCount} sent so far — polling for updates every 10s</p>
            </div>
            <button
              onClick={handleStop}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
            >
              Stop polling
            </button>
          </div>
        </div>
      )}

      <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">All Suppliers</h4>
            <p className="text-sm text-gray-600 mt-1">
              {recipients.length} total &bull; {medalWinnerCount} with medals (stickers attached) &bull;{' '}
              {recipients.length - medalWinnerCount} non-medal
            </p>
            <p className="text-sm text-gray-600">
              {pendingCount} to send &bull; {alreadySentCount} already sent
            </p>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || pendingCount === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              pendingCount === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending…' : pendingCount === 0 ? 'All sent' : `Send to ${pendingCount}`}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowList(!showList)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {showList ? '▼ Hide' : '▶ Show'} recipient list
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setShowTest(!showTest)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showTest ? '▼ Hide' : '▶ Show'} test email
          </button>
        </div>

        {showTest && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-1">Send Test Email</h5>
            <p className="text-xs text-gray-500 mb-3">
              Sends real scoring data for a specific supplier to your test address.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="email"
                placeholder="Send test to (your email)"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Preview data from supplier email"
                value={targetSupplierEmail}
                onChange={e => setTargetSupplierEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendTest}
                disabled={testSending || !testEmail || !targetSupplierEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testSending ? 'Sending…' : 'Send Test'}
              </button>
            </div>
          </div>
        )}

        {showList && (
          <div className="bg-white rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Brand</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Sauces</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Medals</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recipients.map(r => (
                  <tr key={r.email} className={`hover:bg-gray-50 ${r.alreadySent ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-2 text-gray-900 font-medium">{r.brandName}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs">{r.email}</td>
                    <td className="px-3 py-2 text-center text-gray-700">{r.sauceCount}</td>
                    <td className="px-3 py-2 text-center">
                      {r.medalCount > 0 ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800">
                          {r.medalCount} 🏅
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.alreadySent ? (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-500">sent</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700">pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
