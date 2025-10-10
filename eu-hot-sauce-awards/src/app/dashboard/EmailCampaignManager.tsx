'use client'

import { useState, useEffect } from 'react'
import {
  getPreviousSuppliers,
  getPreviousJudges,
  sendSupplierInvitations,
  sendJudgeInvitations,
  sendTestSupplierEmail,
  sendTestJudgeEmail,
  type PreviousParticipant
} from '@/app/actions'

export default function EmailCampaignManager() {
  const [suppliers, setSuppliers] = useState<PreviousParticipant[]>([])
  const [judges, setJudges] = useState<(PreviousParticipant & { judgeType: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showSupplierList, setShowSupplierList] = useState(false)
  const [showJudgeList, setShowJudgeList] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Test email states
  const [showSupplierTest, setShowSupplierTest] = useState(false)
  const [showJudgeTest, setShowJudgeTest] = useState(false)
  const [testSupplierEmail, setTestSupplierEmail] = useState('')
  const [testSupplierBrand, setTestSupplierBrand] = useState('Test Brand')
  const [testJudgeEmail, setTestJudgeEmail] = useState('')
  const [testJudgeName, setTestJudgeName] = useState('Test Judge')
  const [testJudgeType, setTestJudgeType] = useState('pro')

  useEffect(() => {
    loadParticipants()
  }, [])

  async function loadParticipants() {
    setLoading(true)
    try {
      const [suppliersResult, judgesResult] = await Promise.all([
        getPreviousSuppliers(),
        getPreviousJudges(),
      ])

      if ('error' in suppliersResult) {
        setMessage({ type: 'error', text: suppliersResult.error || 'Unknown error loading suppliers' })
      } else {
        setSuppliers(suppliersResult.suppliers || [])
      }

      if ('error' in judgesResult) {
        setMessage({ type: 'error', text: judgesResult.error || 'Unknown error loading judges' })
      } else {
        setJudges(judgesResult.judges || [])
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSendSupplierInvitations() {
    if (!confirm(`Send invitation emails to ${uninvitedSuppliers.length} suppliers?`)) {
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const emailsToSend = uninvitedSuppliers.map(s => s.email)
      const result = await sendSupplierInvitations(emailsToSend)

      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Unknown error sending invitations' })
      } else {
        setMessage({
          type: 'success',
          text: `Successfully sent ${result.sent} invitations! ${result.failed > 0 ? `Failed: ${result.failed}` : ''}`,
        })
        // Reload to update invited dates
        await loadParticipants()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleSendJudgeInvitations() {
    if (!confirm(`Send invitation emails to ${uninvitedJudges.length} judges?`)) {
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const emailsToSend = uninvitedJudges.map(j => j.email)
      const result = await sendJudgeInvitations(emailsToSend)

      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Unknown error sending invitations' })
      } else {
        setMessage({
          type: 'success',
          text: `Successfully sent ${result.sent} invitations! ${result.failed > 0 ? `Failed: ${result.failed}` : ''}`,
        })
        // Reload to update invited dates
        await loadParticipants()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleSendTestSupplierEmail() {
    if (!testSupplierEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const result = await sendTestSupplierEmail(testSupplierEmail, testSupplierBrand)

      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Unknown error sending test email' })
      } else {
        setMessage({
          type: 'success',
          text: result.message || 'Test email sent successfully!',
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  async function handleSendTestJudgeEmail() {
    if (!testJudgeEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const result = await sendTestJudgeEmail(testJudgeEmail, testJudgeName, testJudgeType)

      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Unknown error sending test email' })
      } else {
        setMessage({
          type: 'success',
          text: result.message || 'Test email sent successfully!',
        })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  const uninvitedSuppliers = suppliers.filter(s => !s.invitedDate)
  const invitedSuppliers = suppliers.filter(s => s.invitedDate)
  const uninvitedJudges = judges.filter(j => !j.invitedDate)
  const invitedJudges = judges.filter(j => j.invitedDate)

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading participants...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">2026 Email Campaign</h3>
        <p className="text-sm text-gray-600">
          Invite previous participants to join the 2026 awards. The system automatically excludes
          suppliers who are also judges from the judge invitation list.
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

      {/* Suppliers Section */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Previous Suppliers</h4>
            <p className="text-sm text-gray-600 mt-1">
              {suppliers.length} total suppliers • {uninvitedSuppliers.length} not yet invited
            </p>
          </div>
          <button
            onClick={handleSendSupplierInvitations}
            disabled={sending || uninvitedSuppliers.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              uninvitedSuppliers.length === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending...' : `Send ${uninvitedSuppliers.length} Invitations`}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowSupplierList(!showSupplierList)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {showSupplierList ? '▼ Hide' : '▶ Show'} supplier list
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setShowSupplierTest(!showSupplierTest)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showSupplierTest ? '▼ Hide' : '▶ Show'} test email
          </button>
        </div>

        {showSupplierTest && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Send Test Supplier Email</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="email"
                placeholder="Test email address"
                value={testSupplierEmail}
                onChange={(e) => setTestSupplierEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Brand name (for template)"
                value={testSupplierBrand}
                onChange={(e) => setTestSupplierBrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSendTestSupplierEmail}
                disabled={sending || !testSupplierEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This will send a test email using the current template with the brand name you specify.
            </p>
          </div>
        )}

        {showSupplierList && (
          <div className="space-y-4">
            {uninvitedSuppliers.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Pending Invitations ({uninvitedSuppliers.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Last Participated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {uninvitedSuppliers.map((supplier) => (
                        <tr key={supplier.email} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{supplier.name}</td>
                          <td className="px-3 py-2 text-gray-600">{supplier.email}</td>
                          <td className="px-3 py-2 text-gray-600">{supplier.lastParticipated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invitedSuppliers.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Already Invited ({invitedSuppliers.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Invited Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invitedSuppliers.map((supplier) => (
                        <tr key={supplier.email} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{supplier.name}</td>
                          <td className="px-3 py-2 text-gray-600">{supplier.email}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {supplier.invitedDate
                              ? new Date(supplier.invitedDate).toLocaleDateString()
                              : 'N/A'}
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

      {/* Judges Section */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Previous Judges</h4>
            <p className="text-sm text-gray-600 mt-1">
              {judges.length} total judges (excluding suppliers) • {uninvitedJudges.length} not yet
              invited
            </p>
          </div>
          <button
            onClick={handleSendJudgeInvitations}
            disabled={sending || uninvitedJudges.length === 0}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              uninvitedJudges.length === 0 || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {sending ? 'Sending...' : `Send ${uninvitedJudges.length} Invitations`}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowJudgeList(!showJudgeList)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {showJudgeList ? '▼ Hide' : '▶ Show'} judge list
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setShowJudgeTest(!showJudgeTest)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showJudgeTest ? '▼ Hide' : '▶ Show'} test email
          </button>
        </div>

        {showJudgeTest && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-800 mb-3">Send Test Judge Email</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="email"
                placeholder="Test email address"
                value={testJudgeEmail}
                onChange={(e) => setTestJudgeEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Judge name (for template)"
                value={testJudgeName}
                onChange={(e) => setTestJudgeName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={testJudgeType}
                onChange={(e) => setTestJudgeType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pro">Professional</option>
                <option value="community">Community</option>
              </select>
              <button
                onClick={handleSendTestJudgeEmail}
                disabled={sending || !testJudgeEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This will send a test email using the current template with the name and judge type you specify.
            </p>
          </div>
        )}

        {showJudgeList && (
          <div className="space-y-4">
            {uninvitedJudges.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Pending Invitations ({uninvitedJudges.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Last Participated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {uninvitedJudges.map((judge) => (
                        <tr key={judge.email} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{judge.name}</td>
                          <td className="px-3 py-2 text-gray-600">{judge.email}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                judge.judgeType === 'pro'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {judge.judgeType}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{judge.lastParticipated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invitedJudges.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  Already Invited ({invitedJudges.length})
                </h5>
                <div className="bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                          Invited Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invitedJudges.map((judge) => (
                        <tr key={judge.email} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{judge.name}</td>
                          <td className="px-3 py-2 text-gray-600">{judge.email}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                judge.judgeType === 'pro'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {judge.judgeType}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {judge.invitedDate
                              ? new Date(judge.invitedDate).toLocaleDateString()
                              : 'N/A'}
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
