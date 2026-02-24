import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Subject } from '../data/curriculum';
import { useStudyStore } from '../store/useStudyStore';

interface LoadGradesModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export const LoadGradesModal: React.FC<LoadGradesModalProps> = ({ open, onClose, subjects }) => {
  const { subjectGrades, saveGrades } = useStudyStore();
  const [subjectId, setSubjectId] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (subjects.length > 0 && !subjectId) setSubjectId(subjects[0].id);
  }, [open, subjects, subjectId]);

  useEffect(() => {
    if (!subjectId) return;
    const g = subjectGrades[subjectId];
    const efectiva = g
      ? (g.grade_direct != null
          ? g.grade_direct
          : g.grade_finals && g.grade_finals.length > 0
            ? g.grade_finals[g.grade_finals.length - 1]
            : null)
      : null;
    setGrade(efectiva != null ? String(efectiva) : '');
  }, [subjectId, subjectGrades]);

  const parseGrade = (s: string): number | null => {
    const n = parseFloat(s.replace(',', '.'));
    if (Number.isNaN(n) || n < 1 || n > 10) return null;
    return Math.round(n * 100) / 100;
  };

  const handleSave = async () => {
    if (!subjectId) return;
    const n = parseGrade(grade);
    if (n === null) return;
    setSaving(true);
    await saveGrades(subjectId, n);
    setSaving(false);
    setGrade('');
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const canSave = subjectId && parseGrade(grade) !== null;

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          background: 'rgba(0,0,0,0.6)',
          fontFamily: "'Geist', sans-serif",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            maxWidth: 420,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              Cargar notas
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {subjects.length === 0 ? (
              <>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  Solo podés cargar notas en materias que tengas marcadas como <strong>Aprobadas</strong> en el mapa. Marcá las que ya aprobaste y volvé acá.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Materia
                  </label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Nota (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.01}
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    placeholder="Ej. 8"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  />
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
                    La nota con la que aprobaste la materia (una vez aprobada).
                  </p>
                </div>

                {savedFeedback && (
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#4ADE80',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}>
                    ✓ Guardado. Podés seguir cargando más materias.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: canSave && !saving ? '#4ADE80' : 'rgba(255,255,255,0.1)',
                      color: canSave && !saving ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {saving ? 'Guardando…' : 'Guardar nota'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
