'use client'

import { useState, useEffect, useRef } from 'react'
import {
  getResultsFeedbackRecipients,
  sendResultsFeedbackBatch,
  sendTestResultsFeedback,
  type ResultsRecipient,
} from '@/app/actions'

const BATCH_SIZE = 30
const BATCH_WAIT_SECONDS = 90

export default function ResultsFeedbackSender() {
  const [recipients, setRecipients] = useState<ResultsRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Batch send state
  const [sending, setSending] = useState(false)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [totalSent, setTotalSent] = useState(0)
  const [totalSkipped, setTotalSkipped] = useState(0)
  const [allFailed, setAllFailed] = useState<{ email: string; error: string }[]>([])
  const [showFailed, setShowFailed] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const abortRef = useRef(false)

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
    const pending = recipients.filter(r => !r.alreadySent)
    const batches: string[][] = []
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      batches.push(pending.slice(i, i + BATCH_SIZE).map(r => r.email))
    }

    if (!confirm(`Send results feedback to ${pending.length} suppliers in ${batches.length} batch${batches.length !== 1 ? 'es' : ''} of ${BATCH_SIZE}? This will take approximately ${Math.ceil(batches.length * (BATCH_WAIT_SECONDS + 15) / 60)} minutes.`)) return

    setSending(true)
    setCurrentBatch(0)
    setTotalBatches(batches.length)
    setTotalSent(0)
    setTotalSkipped(0)
    setAllFailed([])
    setMessage(null)
    abortRef.current = false

    let sent = 0
    let skipped = 0
    const failed: { email: string; error: string }[] = []

    for (let i = 0; i < batches.length; i++) {
      if (abortRef.current) {
        setMessage({ type: 'error', text: `Stopped after ${sent} sends.` })
        break
      }

      setCurrentBatch(i + 1)

      try {
        const result = await sendResultsFeedbackBatch(batches[i])
        if ('error' in result) {
          setMessage({ type: 'error', text: result.error || 'Batch failed' })
          break
        }
        sent += result.sent
        skipped += result.skipped ?? 0
        failed.push(...(result.failedEmails || []))
        setTotalSent(sent)
        setTotalSkipped(skipped)
        setAllFailed([...failed])
      } catch (error: any) {
        setMessage({ type: 'error', text: `Batch ${i + 1} failed: ${error.message}` })
        break
      }

      if (i < batches.length - 1 && !abortRef.current) {
        await waitWithCountdown(BATCH_WAIT_SECONDS)
      }
    }

    setCountdown(null)
    setSending(false)

    if (!abortRef.current) {
      setMessage({
        type: failed.length > 0 ? 'error' : 'success',
        text: `Done! Sent ${sent} emails.${skipped > 0 ? ` ${skipped} skipped (no judged sauces or already sent).` : ''}${failed.length > 0 ? ` ${failed.length} failed.` : ''}`,
      })
      if (failed.length > 0) setShowFailed(true)
      loadRecipients()
    }
  }

  function waitWithCountdown(seconds: number): Promise<void> {
    return new Promise(resolve => {
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
    const emails = allFailed.map(f => f.email)
    try {
      const result = await sendResultsFeedbackBatch(emails)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Retry failed' })
      } else {
        const stillFailed = result.failedEmails || []
        setAllFailed(stillFailed)
        setTotalSent(prev => prev + result.sent)
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
  const batchCount = Math.ceil(pendingCount / BATCH_SIZE)

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
          attachments. One email per supplier covering all their sauces. Sends in batches of{' '}
          {BATCH_SIZE} with a {BATCH_WAIT_SECONDS}s pause between batches to stay within Gmail limits.
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

      {/* Batch progress */}
      {sending && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Batch {currentBatch} of {totalBatches}
              </p>
              <p className="text-sm text-blue-700">
                {totalSent} sent{totalSkipped > 0 ? `, ${totalSkipped} skipped` : ''}
              </p>
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
          {countdown !== null ? (
            <p className="text-sm text-blue-700 text-center">
              Next batch in <strong>{countdown}s</strong>…
            </p>
          ) : (
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
                  {allFailed.map(f => (
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
            <h4 className="text-lg font-semibold text-gray-900">All Suppliers</h4>
            <p className="text-sm text-gray-600 mt-1">
              {recipients.length} total &bull; {medalWinnerCount} with medals (stickers attached) &bull;{' '}
              {recipients.length - medalWinnerCount} non-medal
            </p>
            <p className="text-sm text-gray-600">
              {pendingCount} to send &bull; {alreadySentCount} already sent
              {pendingCount > 0 ? ` &bull; ${batchCount} batch${batchCount !== 1 ? 'es' : ''} of ${BATCH_SIZE}` : ''}
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
