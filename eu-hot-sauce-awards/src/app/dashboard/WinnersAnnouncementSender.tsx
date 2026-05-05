'use client'

import { useState, useEffect, useRef } from 'react'
import {
  getWinnersAnnouncementRecipients,
  sendWinnersAnnouncement,
  sendTestWinnersEmail,
  type WinnersAnnouncementRecipient,
} from '@/app/actions'

const BATCH_SIZE = 50
const BATCH_WAIT_SECONDS = 90

export default function WinnersAnnouncementSender() {
  const [recipients, setRecipients] = useState<WinnersAnnouncementRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Batch send state
  const [sending, setSending] = useState(false)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [totalSent, setTotalSent] = useState(0)
  const [allFailed, setAllFailed] = useState<{ email: string; error: string }[]>([])
  const [showFailed, setShowFailed] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const abortRef = useRef(false)

  // Test state
  const [testSending, setTestSending] = useState(false)
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

  async function handleSend() {
    const batches: string[][] = []
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      batches.push(recipients.slice(i, i + BATCH_SIZE).map((r) => r.email))
    }

    if (!confirm(`Send winners announcement to ${recipients.length} recipients in ${batches.length} batches of ${BATCH_SIZE}? This will take approximately ${Math.ceil(batches.length * (BATCH_WAIT_SECONDS + 15) / 60)} minutes.`)) return

    setSending(true)
    setCurrentBatch(0)
    setTotalBatches(batches.length)
    setTotalSent(0)
    setAllFailed([])
    setMessage(null)
    abortRef.current = false

    let sent = 0
    const failed: { email: string; error: string }[] = []

    for (let i = 0; i < batches.length; i++) {
      if (abortRef.current) {
        setMessage({ type: 'error', text: `Stopped after ${sent} sends.` })
        break
      }

      setCurrentBatch(i + 1)

      try {
        const result = await sendWinnersAnnouncement(batches[i])
        if ('error' in result) {
          setMessage({ type: 'error', text: result.error || 'Batch failed' })
          break
        }
        sent += result.sent
        failed.push(...(result.failedEmails || []))
        setTotalSent(sent)
        setAllFailed([...failed])
      } catch (error: any) {
        setMessage({ type: 'error', text: `Batch ${i + 1} failed: ${error.message}` })
        break
      }

      // Wait between batches (not after the last one)
      if (i < batches.length - 1 && !abortRef.current) {
        await waitWithCountdown(BATCH_WAIT_SECONDS)
      }
    }

    setCountdown(null)
    setSending(false)

    if (!abortRef.current) {
      setMessage({
        type: failed.length > 0 ? 'error' : 'success',
        text: `Done! Sent ${sent} emails.${failed.length > 0 ? ` ${failed.length} failed.` : ''}`,
      })
      if (failed.length > 0) setShowFailed(true)
    }
  }

  function waitWithCountdown(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      let remaining = seconds
      setCountdown(remaining)
      const interval = setInterval(() => {
        remaining -= 1
        if (remaining <= 0 || abortRef.current) {
          clearInterval(interval)
          setCountdown(null)
          resolve()
        } else {
          setCountdown(remaining)
        }
      }, 1000)
    })
  }

  function handleStop() {
    abortRef.current = true
  }

  async function handleRetryFailed() {
    if (!confirm(`Retry ${allFailed.length} failed emails?`)) return
    setSending(true)
    setMessage(null)
    abortRef.current = false
    const emails = allFailed.map((f) => f.email)
    try {
      const result = await sendWinnersAnnouncement(emails)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Retry failed' })
      } else {
        const stillFailed = result.failedEmails || []
        setAllFailed(stillFailed)
        setTotalSent((prev) => prev + result.sent)
        setMessage({
          type: stillFailed.length > 0 ? 'error' : 'success',
          text: `Retried: ${result.sent} sent${stillFailed.length > 0 ? `, ${stillFailed.length} still failing` : ''}`,
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleSendTest() {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }
    setTestSending(true)
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
      setTestSending(false)
    }
  }

  const judgeCount = recipients.filter((r) => r.recipientType === 'judge').length
  const supplierCount = recipients.filter((r) => r.recipientType === 'supplier').length
  const batchCount = Math.ceil(recipients.length / BATCH_SIZE)

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
          Send the 2026 winners announcement to all judges and suppliers across all years. Sends in
          batches of {BATCH_SIZE} with a {BATCH_WAIT_SECONDS}s pause between batches to stay within
          Gmail limits.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Video:</strong> youtube.com/watch?v=nQsGH0tPhZ8 &bull;{' '}
        <strong>Instagram:</strong> @republicofheat &bull;{' '}
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

      {/* Batch progress */}
      {sending && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Batch {currentBatch} of {totalBatches}
              </p>
              <p className="text-sm text-blue-700">{totalSent} sent so far</p>
            </div>
            <button
              onClick={handleStop}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
            >
              Stop
            </button>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentBatch / totalBatches) * 100}%` }}
            />
          </div>
          {countdown !== null && (
            <p className="text-sm text-blue-700 text-center">
              Next batch in <strong>{countdown}s</strong>…
            </p>
          )}
          {countdown === null && (
            <p className="text-sm text-blue-700 text-center">Sending batch {currentBatch}…</p>
          )}
        </div>
      )}

      {/* Failed emails */}
      {allFailed.length > 0 && !sending && (
        <div className="border border-red-200 rounded-xl p-4 bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-red-800">{allFailed.length} failed sends</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFailed(!showFailed)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                {showFailed ? '▼ Hide' : '▶ Show'} details
              </button>
              <button
                onClick={handleRetryFailed}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
              >
                Retry {allFailed.length}
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
                  {allFailed.map((f) => (
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
              &bull; {batchCount} batch{batchCount !== 1 ? 'es' : ''} of {BATCH_SIZE}
            </p>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || recipients.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              recipients.length === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending…' : `Send to ${recipients.length}`}
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
                disabled={testSending || !testEmail}
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
