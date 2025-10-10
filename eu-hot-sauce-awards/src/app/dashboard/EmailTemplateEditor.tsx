'use client'

import { useState, useEffect } from 'react'
import { getEmailTemplates, getEmailTemplate, updateEmailTemplate, type EmailTemplate } from '@/app/actions'

export default function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editMode, setEditMode] = useState(false)

  // Editable fields
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [textBody, setTextBody] = useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)
    try {
      const result = await getEmailTemplates()
      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to load templates' })
      } else {
        setTemplates(result.templates || [])
        if (result.templates && result.templates.length > 0) {
          selectTemplate(result.templates[0])
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function selectTemplate(template: EmailTemplate) {
    setSelectedTemplate(template)
    setSubject(template.subject)
    setHtmlBody(template.html_body)
    setTextBody(template.text_body || '')
    setEditMode(false)
    setMessage(null)
  }

  async function handleSave() {
    if (!selectedTemplate) return

    setSaving(true)
    setMessage(null)

    try {
      const result = await updateEmailTemplate(selectedTemplate.template_key, {
        subject,
        html_body: htmlBody,
        text_body: textBody,
      })

      if ('error' in result) {
        setMessage({ type: 'error', text: result.error || 'Failed to save template' })
      } else {
        setMessage({ type: 'success', text: 'Template saved successfully!' })
        setEditMode(false)
        await loadTemplates()
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject)
      setHtmlBody(selectedTemplate.html_body)
      setTextBody(selectedTemplate.text_body || '')
    }
    setEditMode(false)
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Template Editor</h3>
        <p className="text-sm text-gray-600">
          Edit email templates for campaigns. Use variables like{' '}
          <code className="bg-gray-100 px-1 rounded">{`{{brandName}}`}</code> or{' '}
          <code className="bg-gray-100 px-1 rounded">{`{{name}}`}</code> for personalization.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="lg:col-span-1 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Template</h4>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => selectTemplate(template)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'bg-orange-50 border-orange-300 text-orange-900'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-sm">{template.name}</div>
              {template.description && (
                <div className="text-xs text-gray-500 mt-1">{template.description}</div>
              )}
            </button>
          ))}
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h4>
                  {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available variables:{' '}
                      {selectedTemplate.variables.map((v) => (
                        <code key={v} className="bg-gray-100 px-1 rounded mx-1">
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </p>
                  )}
                </div>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Edit Template
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Subject Line */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {subject}
                    </div>
                  )}
                </div>

                {/* HTML Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Body
                  </label>
                  {editMode ? (
                    <textarea
                      value={htmlBody}
                      onChange={(e) => setHtmlBody(e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-xs font-mono">{htmlBody}</pre>
                    </div>
                  )}
                </div>

                {/* Text Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plain Text Body (for email clients that don't support HTML)
                  </label>
                  {editMode ? (
                    <textarea
                      value={textBody}
                      onChange={(e) => setTextBody(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      <pre className="whitespace-pre-wrap text-sm">{textBody || '(none)'}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a template to edit
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
