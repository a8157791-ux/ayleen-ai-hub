'use client'

import { useState } from 'react'
import { saveConfig } from '@/lib/config'

// ─────────────────────────────────────────────
// CategorySelect
// 카테고리 선택 + 인라인 추가/삭제
// ─────────────────────────────────────────────
interface CategorySelectProps {
  configKey: string
  value: string
  categories: string[]
  onChange: (val: string) => void
  onCategoriesChange: (cats: string[]) => void
}

export function CategorySelect({
  configKey, value, categories, onChange, onCategoriesChange,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    const trimmed = newCat.trim().toLowerCase().replace(/\s+/g, '-')
    if (!trimmed || categories.includes(trimmed)) {
      setNewCat('')
      setAdding(false)
      return
    }
    setSaving(true)
    const next = [...categories, trimmed]
    await saveConfig(configKey, next)
    onCategoriesChange(next)
    onChange(trimmed)
    setNewCat('')
    setAdding(false)
    setSaving(false)
  }

  const handleDelete = async (cat: string) => {
    if (!confirm(`"${cat}" 카테고리를 삭제할까요?`)) return
    const next = categories.filter(c => c !== cat)
    await saveConfig(configKey, next)
    onCategoriesChange(next)
    if (value === cat) onChange(next[0] ?? '')
  }

  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>카테고리</span>
        <button
          type="button"
          onClick={() => { setAdding(a => !a); setNewCat('') }}
          style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: adding ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.15)',
            color: adding ? 'var(--color-text-2)' : 'var(--color-blue)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
          }}
        >
          {adding ? '취소' : '+ 추가'}
        </button>
      </label>

      {/* 인라인 추가 입력 */}
      {adding && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            className="form-input"
            style={{ flex: 1, fontSize: 13 }}
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="새 카테고리 이름"
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || !newCat.trim()}
            className="btn btn-primary"
            style={{ padding: '0 14px', fontSize: 13, flexShrink: 0 }}
          >
            {saving ? '...' : '추가'}
          </button>
        </div>
      )}

      {/* 카테고리 태그 목록 (선택 + 삭제) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {categories.map(cat => (
          <div
            key={cat}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${value === cat ? 'var(--color-blue)' : 'var(--color-border-2)'}`,
              background: value === cat ? 'rgba(59,130,246,0.15)' : 'var(--color-bg-3)',
              color: value === cat ? 'var(--color-blue)' : 'var(--color-text-2)',
              fontSize: 12, fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s',
            }}
          >
            <span onClick={() => onChange(cat)}>{cat}</span>
            <button
              type="button"
              onClick={() => handleDelete(cat)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-3)', padding: '0 0 0 2px',
                fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center',
              }}
              title="삭제"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 실제 select는 hidden — 폼 제출용 */}
      <input type="hidden" value={value} />
    </div>
  )
}

// ─────────────────────────────────────────────
// ToolTagInput
// 자주 쓴 툴 태그 클릭 선택 + 직접 입력 + 태그 추가/삭제
// ─────────────────────────────────────────────
interface ToolTagInputProps {
  value: string
  toolTags: string[]
  onChange: (val: string) => void
  onToolTagsChange: (tags: string[]) => void
  placeholder?: string
}

export function ToolTagInput({
  value, toolTags, onChange, onToolTagsChange, placeholder = '예: Claude, Midjourney',
}: ToolTagInputProps) {
  const [adding, setAdding] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = async () => {
    const trimmed = newTag.trim()
    if (!trimmed || toolTags.includes(trimmed)) {
      setNewTag('')
      setAdding(false)
      return
    }
    const next = [...toolTags, trimmed]
    await saveConfig('tool_tags', next)
    onToolTagsChange(next)
    onChange(trimmed)
    setNewTag('')
    setAdding(false)
  }

  const handleDeleteTag = async (tag: string) => {
    const next = toolTags.filter(t => t !== tag)
    await saveConfig('tool_tags', next)
    onToolTagsChange(next)
    if (value === tag) onChange('')
  }

  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>사용 툴</span>
        <button
          type="button"
          onClick={() => { setAdding(a => !a); setNewTag('') }}
          style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: adding ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.15)',
            color: adding ? 'var(--color-text-2)' : 'var(--color-blue)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
          }}
        >
          {adding ? '취소' : '+ 툴 추가'}
        </button>
      </label>

      {/* 자주 쓴 툴 태그 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {toolTags.map(tag => (
          <div
            key={tag}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${value === tag ? 'var(--color-purple)' : 'var(--color-border-2)'}`,
              background: value === tag ? 'rgba(167,139,250,0.15)' : 'var(--color-bg-3)',
              color: value === tag ? 'var(--color-purple)' : 'var(--color-text-3)',
              fontSize: 11, fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s',
            }}
          >
            <span onClick={() => onChange(value === tag ? '' : tag)}>{tag}</span>
            <button
              type="button"
              onClick={() => handleDeleteTag(tag)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-3)', padding: '0 0 0 2px',
                fontSize: 11, lineHeight: 1, display: 'flex', alignItems: 'center',
              }}
              title="태그 삭제"
            >
              ×
            </button>
          </div>
        ))}

        {/* 새 툴 추가 인라인 */}
        {adding && (
          <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 4 }}>
            <input
              className="form-input"
              style={{ flex: 1, fontSize: 13 }}
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTag()}
              placeholder="툴 이름 입력"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="btn btn-primary"
              style={{ padding: '0 14px', fontSize: 13, flexShrink: 0 }}
            >
              추가
            </button>
          </div>
        )}
      </div>

      {/* 직접 입력 (태그 클릭 외 자유 입력도 가능) */}
      <input
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ fontSize: 13 }}
      />
    </div>
  )
}
