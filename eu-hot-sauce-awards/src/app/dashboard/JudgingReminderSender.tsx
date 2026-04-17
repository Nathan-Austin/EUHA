'use client'

import { useState, useEffect } from 'react'
import {
  getJudgesForReminder,
  sendJudgingReminders,
  sendTestJudgingReminderEmail,
  type JudgeForReminder,
} from '@/app/actions'

export default function JudgingReminderSender() {
  const [judges, setJudges] = useState<JudgeForReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showList, setShowList] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [failedEmails, setFailedEmails] = useState<{ email: string; error: string }[]>([])
  const [showFailed, setShowFailed] = useState(false)

  const [testEmail, setTestEmail] = useState('')
  const [testName, setTestName] = useState('Test Judge')
  const [testType, setTestType] = useState('community')

  useEffect(() => {
    loadJudges()
  }, [])

  async function loadJudges() {
    setLoading(true)
    try {
      const result = await getJudgesForReminder()
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to load judges' })
      } else {
        setJudges(result.judges || [])
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReminders(judgeIds?: string[]) {
    const targets = judgeIds ?? judges.filter((j) => !j.hasScores).map((j) => j.id)
    if (!confirm(`Send judging deadline reminders to ${targets.length} judges?`)) return

    setSending(true)
    setMessage(null)
    setFailedEmails([])

    try {
      const result = await sendJudgingReminders(targets)
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to send reminders' })
      } else {
        setFailedEmails(result.failedEmails || [])
        setMessage({
          type: result.failed > 0 ? 'error' : 'success',
          text: `Sent ${result.sent} reminder${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? `. ${result.failed} failed — see details below.` : '!'}`,
        })
        if (result.failed > 0) setShowFailed(true)
        await loadJudges()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleRetryFailed() {
    const retryIds = judges
      .filter((j) => failedEmails.some((f) => f.email === j.email))
      .map((j) => j.id)
    if (retryIds.length === 0) return
    await handleSendReminders(retryIds)
  }

  async function handleSendTest() {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const result = await sendTestJudgingReminderEmail(testEmail, testName, testType)
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

  const pendingJudges = judges.filter((j) => !j.hasScores)
  const scoredJudges = judges.filter((j) => j.hasScores)

  const typeLabel = (type: string) =>
    type === 'pro' ? 'Pro' : type === 'community' ? 'Community' : type === 'supplier' ? 'Supplier' : type

  const typeBadgeClass = (type: string) =>
    type === 'pro'
      ? 'bg-purple-100 text-purple-800'
      : type === 'community'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800'

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading judges...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Judging Deadline Reminder</h3>
        <p className="text-sm text-gray-600">
          Send a reminder to all 2026 judges who haven&apos;t submitted scores yet. Judges who have already
          scored can safely ignore the email.
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

      {failedEmails.length > 0 && (
        <div className="border border-red-200 rounded-xl p-4 bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-red-800">
              {failedEmails.length} failed sends
            </h4>
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
            <h4 className="text-lg font-semibold text-gray-900">2026 Judges</h4>
            <p className="text-sm text-gray-600 mt-1">
              {judges.length} total &bull; {pendingJudges.length} haven&apos;t scored yet &bull;{' '}
              {scoredJudges.length} already scored
            </p>
          </div>
          <button
            onClick={() => handleSendReminders()}
            disabled={sending || pendingJudges.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              pendingJudges.length === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending...' : `Send ${pendingJudges.length} Reminders`}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowList(!showList)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {showList ? '▼ Hide' : '▶ Show'} judge list
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
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Send Test Reminder Email</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="email"
                placeholder="Test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Judge name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="community">Community</option>
                <option value="pro">Professional</option>
                <option value="supplier">Supplier</option>
              </select>
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
          <div className="space-y-4">
            {pendingJudges.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Will receive reminder ({pendingJudges.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingJudges.map((judge) => (
                        <tr key={judge.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{judge.name}</td>
                          <td className="px-3 py-2 text-gray-600">{judge.email}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${typeBadgeClass(judge.type)}`}>
                              {typeLabel(judge.type)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {scoredJudges.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Already scored — will not receive reminder ({scoredJudges.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scoredJudges.map((judge) => (
                        <tr key={judge.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{judge.name}</td>
                          <td className="px-3 py-2 text-gray-600">{judge.email}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${typeBadgeClass(judge.type)}`}>
                              {typeLabel(judge.type)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
