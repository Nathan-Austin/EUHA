'use client'

import { useState, useEffect } from 'react'
import {
  getWinnersAnnouncementRecipients,
  sendWinnersAnnouncement,
  sendTestWinnersEmail,
  type WinnersAnnouncementRecipient,
} from '@/app/actions'

export default function WinnersAnnouncementSender() {
  const [recipients, setRecipients] = useState<WinnersAnnouncementRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [failedEmails, setFailedEmails] = useState<{ email: string; error: string }[]>([])
  const [showFailed, setShowFailed] = useState(false)

  const [testEmail, setTestEmail] = useState('')
  const [testName, setTestName] = useState('Test User')

  useEffect(() => {
    loadRecipients()
  }, [])

  async function loadRecipients() {
    setLoading(true)
    try {
      const result = await getWinnersAnnouncementRecipients()
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

  async function handleSend(emailsToSend?: string[]) {
    const targets = emailsToSend ?? recipients.map((r) => r.email)
    if (!confirm(`Send winners announcement to ${targets.length} recipients?`)) return

    setSending(true)
    setMessage(null)
    setFailedEmails([])

    try {
      const result = await sendWinnersAnnouncement(targets)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to send' })
      } else {
        setFailedEmails(result.failedEmails || [])
        setMessage({
          type: result.failed > 0 ? 'error' : 'success',
          text: `Sent ${result.sent} email${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} failed — see details below.` : '!'}`,
        })
        if (result.failed > 0) setShowFailed(true)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleRetryFailed() {
    const retryEmails = failedEmails.map((f) => f.email)
    if (retryEmails.length === 0) return
    await handleSend(retryEmails)
  }

  async function handleSendTest() {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }
    setSending(true)
    setMessage(null)
    try {
      const result = await sendTestWinnersEmail(testEmail, testName)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' })
      } else {
        setMessage({ type: 'success', text: result.message || 'Test email sent!' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  const judgeCount = recipients.filter((r) => r.recipientType === 'judge').length
  const supplierCount = recipients.filter((r) => r.recipientType === 'supplier').length

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
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Winners Announcement</h3>
        <p className="text-sm text-gray-600">
          Send the 2026 winners announcement email to all judges and suppliers — includes the YouTube
          video link, Instagram teasers, and the full results date (20 May).
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Video:</strong> youtube.com/watch?v=nQsGH0tPhZ8 &bull;{' '}
        <strong>Instagram:</strong> @republicofheat &amp; @europeanhotsauceawards &bull;{' '}
        <strong>Full results:</strong> heatawards.eu/results — 20 May 2026
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

      {failedEmails.length > 0 && (
        <div className="border border-red-200 rounded-xl p-4 bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-red-800">{failedEmails.length} failed sends</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFailed(!showFailed)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {showFailed ? '▼ Hide' : '▶ Show'} details
              </button>
              <button
                onClick={handleRetryFailed}
                disabled={sending}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Retrying...' : `Retry ${failedEmails.length}`}
              </button>
            </div>
          </div>
          {showFailed && (
            <div className="bg-white rounded-lg border border-red-200 max-h-48 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-red-700">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {failedEmails.map((f) => (
                    <tr key={f.email}>
                      <td className="px-3 py-2 text-gray-900">{f.email}</td>
                      <td className="px-3 py-2 text-red-700 text-xs">{f.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="border border-orange-200 rounded-xl p-6 bg-orange-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">All Judges &amp; Suppliers</h4>
            <p className="text-sm text-gray-600 mt-1">
              {recipients.length} total &bull; {judgeCount} judges &bull; {supplierCount} suppliers
              (supplier-judges counted once as judge)
            </p>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={sending || recipients.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              recipients.length === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending...' : `Send to ${recipients.length}`}
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
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Send Test Email</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="email"
                placeholder="Test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Name (for personalisation)"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendTest}
                disabled={sending || !testEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        )}

        {showList && (
          <div className="bg-white rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recipients.map((r) => (
                  <tr key={r.email} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-gray-600">{r.email}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          r.recipientType === 'judge'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {r.recipientType}
                      </span>
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
