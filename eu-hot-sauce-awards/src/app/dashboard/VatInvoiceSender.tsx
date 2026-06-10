'use client'

import { useState, useEffect, useRef } from 'react'
import {
  getVatInvoiceRecipients,
  sendBulkVatInvoices,
  type VatInvoiceRecipient,
} from '@/app/actions'

const BATCH_SIZE = 10

export default function VatInvoiceSender() {
  const [recipients, setRecipients] = useState<VatInvoiceRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showList, setShowList] = useState(false)

  const [sending, setSending] = useState(false)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [totalSent, setTotalSent] = useState(0)
  const [totalSkipped, setTotalSkipped] = useState(0)
  const [allFailed, setAllFailed] = useState<{ email: string; error: string }[]>([])
  const [showFailed, setShowFailed] = useState(false)
  const abortRef = useRef(false)

  useEffect(() => { loadRecipients() }, [])

  async function loadRecipients() {
    setLoading(true)
    try {
      const result = await getVatInvoiceRecipients()
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setRecipients(result.recipients)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const pending = recipients.filter((r) => r.status === 'pending')
  const sent = recipients.filter((r) => r.status === 'sent')
  const failed = recipients.filter((r) => r.status === 'failed')

  async function handleSendAll() {
    const toSend = pending.map((r) => r.id)
    if (toSend.length === 0) return
    if (!confirm(`Send VAT invoices to ${toSend.length} supplier${toSend.length !== 1 ? 's' : ''}?`)) return

    const batches: string[][] = []
    for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
      batches.push(toSend.slice(i, i + BATCH_SIZE))
    }

    setSending(true)
    setCurrentBatch(0)
    setTotalBatches(batches.length)
    setTotalSent(0)
    setTotalSkipped(0)
    setAllFailed([])
    setMessage(null)
    abortRef.current = false

    let sentCount = 0
    let skippedCount = 0
    const failedList: { email: string; error: string }[] = []

    for (let i = 0; i < batches.length; i++) {
      if (abortRef.current) {
        setMessage({ type: 'error', text: `Stopped after ${sentCount} sends.` })
        break
      }

      setCurrentBatch(i + 1)

      try {
        const result = await sendBulkVatInvoices(batches[i])
        if ('error' in result) {
          setMessage({ type: 'error', text: result.error })
          break
        }
        sentCount += result.sent
        skippedCount += result.skipped
        failedList.push(...result.failedEmails)
        setTotalSent(sentCount)
        setTotalSkipped(skippedCount)
        setAllFailed([...failedList])
      } catch (err: any) {
        setMessage({ type: 'error', text: `Batch ${i + 1} failed: ${err.message}` })
        break
      }
    }

    setSending(false)

    if (!abortRef.current) {
      setMessage({
        type: failedList.length > 0 ? 'error' : 'success',
        text: `Done! Sent ${sentCount} invoice${sentCount !== 1 ? 's' : ''}.${skippedCount > 0 ? ` ${skippedCount} skipped.` : ''}${failedList.length > 0 ? ` ${failedList.length} failed.` : ''}`,
      })
      if (failedList.length > 0) setShowFailed(true)
    }

    await loadRecipients()
  }

  async function handleRetryFailed() {
    if (!confirm(`Retry ${allFailed.length} failed email${allFailed.length !== 1 ? 's' : ''}?`)) return
    const failedIds = recipients
      .filter((r) => allFailed.some((f) => f.email === r.email))
      .map((r) => r.id)

    setSending(true)
    setMessage(null)
    abortRef.current = false

    try {
      const result = await sendBulkVatInvoices(failedIds)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error })
      } else {
        const stillFailed = result.failedEmails
        setAllFailed(stillFailed)
        setTotalSent((prev) => prev + result.sent)
        setMessage({
          type: stillFailed.length > 0 ? 'error' : 'success',
          text: `Retried: ${result.sent} sent${stillFailed.length > 0 ? `, ${stillFailed.length} still failing` : ''}.`,
        })
        if (stillFailed.length === 0) setShowFailed(false)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSending(false)
    }

    await loadRecipients()
  }

  if (loading) {
    return <p className="text-sm text-gray-500 py-4">Loading VAT invoice recipients…</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">VAT Invoice Sender</h3>
        <p className="text-sm text-gray-600 mt-1">
          Send VAT invoices to all suppliers with paid entries for {new Date().getFullYear()}.
          Already-sent suppliers are skipped automatically.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{pending.length}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-700">{sent.length}</p>
          <p className="text-xs text-gray-500 mt-1">Sent</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-red-700">{failed.length}</p>
          <p className="text-xs text-gray-500 mt-1">Failed</p>
        </div>
      </div>

      {/* Progress during send */}
      {sending && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-orange-800">
              Sending batch {currentBatch} of {totalBatches}…
            </p>
            <button
              onClick={() => { abortRef.current = true }}
              className="text-xs text-orange-700 underline hover:no-underline"
            >
              Stop
            </button>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${totalBatches > 0 ? (currentBatch / totalBatches) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-orange-700">
            {totalSent} sent · {totalSkipped} skipped · {allFailed.length} failed
          </p>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border-green-300 bg-green-50 text-green-800'
            : 'border-red-300 bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Failed list */}
      {showFailed && allFailed.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-800">Failed recipients:</p>
          <ul className="space-y-1 text-xs text-red-700 max-h-40 overflow-y-auto">
            {allFailed.map((f) => (
              <li key={f.email}>
                <span className="font-medium">{f.email}</span> — {f.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSendAll}
          disabled={sending || pending.length === 0}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'Sending…' : `Send to ${pending.length} Pending`}
        </button>

        {allFailed.length > 0 && (
          <button
            onClick={handleRetryFailed}
            disabled={sending}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Retry {allFailed.length} Failed
          </button>
        )}

        <button
          onClick={() => setShowList((v) => !v)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {showList ? 'Hide' : 'Show'} Recipients ({recipients.length})
        </button>

        <button
          onClick={loadRecipients}
          disabled={sending || loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Recipient list */}
      {showList && recipients.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Supplier</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Entries</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Invoice #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{r.brand_name}</td>
                  <td className="px-4 py-2 text-gray-600">{r.email}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{r.entry_count}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{r.gross_amount}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : r.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 font-mono text-xs">{r.invoice_number ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
