import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlanStore, type PlanSubject } from '../store/usePlanStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, ChevronDown,
  GraduationCap, X,
} from 'lucide-react';

const CATEGORIES_BASE = [
  'Programación', 'Matemáticas', 'Software', 'Bases de Datos',
  'Redes', 'Sistemas', 'Hardware', 'General', 'Electiva',
];

const OTRAS_CAT = '__otra__';

const YEARS = [1, 2, 3, 4, 5];
const SEMESTERS = [
  { value: 1, label: '1° Cuatrimestre' },
  { value: 2, label: '2° Cuatrimestre' },
  { value: 0, label: 'Anual' },
];

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export const PlanEditor: React.FC<Props> = ({ onComplete, onBack }) => {
  const { user } = useAuth();
  const { createCustomPlan } = usePlanStore();

  const [planName, setPlanName] = useState('');
  const [subjects, setSubjects] = useState<PlanSubject[]>([]);
  const [saving, setSaving] = useState(false);

  // New subject form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newYear, setNewYear] = useState(1);
  const [newSemester, setNewSemester] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryCustom, setNewCategoryCustom] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newTitleName, setNewTitleName] = useState('');
  const [newCorrelatives, setNewCorrelatives] = useState<string[]>([]);

  const categoryOptions = [...new Set([...CATEGORIES_BASE, ...subjects.map(s => s.category), ...customCategories])].filter(Boolean);
  const effectiveCategory = newCategory === OTRAS_CAT ? newCategoryCustom.trim() : newCategory;

  const canAddSubject = newName.trim() && newTitleName.trim() !== '' && effectiveCategory !== '';

  const addSubject = () => {
    if (!newName.trim() || !newTitleName.trim()) return;
    const cat = effectiveCategory || 'General';
    if (!cat) return;

    const id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const titleName = newTitleName.trim();
    if (newCategory === OTRAS_CAT && newCategoryCustom.trim() && !customCategories.includes(newCategoryCustom.trim())) {
      setCustomCategories(prev => [...prev, newCategoryCustom.trim()]);
    }

    setSubjects(prev => [...prev, {
      subject_id: id,
      name: newName.trim(),
      year: newYear,
      semester: newSemester,
      is_analyst: titleName.toLowerCase().includes('analista'),
      category: cat,
      correlatives: newCorrelatives,
      title_name: titleName,
    }]);

    setNewName('');
    setNewCategory('');
    setNewCategoryCustom('');
    setNewTitleName('');
    setNewCorrelatives([]);
    setShowAddForm(false);
  };

  const removeSubject = (id: string) => {
    setSubjects(prev => {
      const filtered = prev.filter(s => s.subject_id !== id);
      // Also remove from correlatives of other subjects
      return filtered.map(s => ({
        ...s,
        correlatives: s.correlatives.filter(c => c !== id),
      }));
    });
  };

  const handleSave = async () => {
    if (!user || !planName.trim() || subjects.length === 0) return;
    setSaving(true);
    await createCustomPlan(user.id, planName.trim(), subjects);
    setSaving(false);
    onComplete();
  };

  const toggleCorrelative = (subjectId: string) => {
    setNewCorrelatives(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Group subjects for display
  const grouped: Record<string, PlanSubject[]> = {};
  subjects.forEach(s => {
    const k = `${s.year}-${s.semester}`;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(s);
  });

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '12px',
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
    cursor: 'text',
  };

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Syne', sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
          </button>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            Crear Plan de Estudios
          </h2>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !planName.trim() || subjects.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: subjects.length > 0 && planName.trim()
              ? 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(168,85,247,0.8))'
              : 'rgba(255,255,255,0.05)',
            color: subjects.length > 0 && planName.trim()
              ? 'white'
              : 'rgba(255,255,255,0.2)',
            fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif",
            cursor: subjects.length > 0 && planName.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
          Guardar plan
        </button>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Plan name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px',
            }}>
              <GraduationCap size={12} /> Nombre del plan
            </label>
            <input
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="Ej: Ing. Sistemas 2024, Diseño Gráfico..."
              style={{ ...inputStyle, width: '100%', padding: '10px 14px', fontSize: '13px' }}
            />
          </div>

          {/* Subjects list */}
          {Object.keys(grouped)
            .sort((a, b) => {
              const [ay, as_] = a.split('-').map(Number);
              const [by, bs] = b.split('-').map(Number);
              return ay * 10 + as_ - (by * 10 + bs);
            })
            .map(key => {
              const [y, s] = key.split('-').map(Number);
              const label = s === 0 ? `${y}° Año · Anual` : `${y}° Año · ${s}° Cuat.`;

              return (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <div style={{
                    fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
                  }}>
                    {label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {grouped[key].map(sub => (
                      <motion.div
                        key={sub.subject_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(sub.title_name || sub.is_analyst !== undefined) && (
                            <span style={{
                              fontSize: '8px', fontWeight: 700,
                              color: sub.is_analyst ? 'rgba(59,130,246,0.7)' : 'rgba(168,85,247,0.7)',
                              background: sub.is_analyst ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)',
                              padding: '2px 5px', borderRadius: '3px',
                            }}>
                              {sub.title_name || (sub.is_analyst ? 'A' : 'I')}
                            </span>
                          )}
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>
                              {sub.category}
                              {sub.correlatives.length > 0 && ` · ${sub.correlatives.length} correlativa(s)`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSubject(sub.subject_id)}
                          style={{
                            width: 24, height: 24, borderRadius: '6px', border: 'none',
                            background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.5)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Empty state */}
          {subjects.length === 0 && !showAddForm && (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              color: 'rgba(255,255,255,0.15)', fontSize: '12px',
            }}>
              <GraduationCap size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <div>Todavía no agregaste materias</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>Usá el botón de abajo para empezar</div>
            </div>
          )}

          {/* Add subject form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: 'rgba(59,130,246,0.03)',
                  border: '1px solid rgba(59,130,246,0.12)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(59,130,246,0.7)' }}>
                    Nueva materia
                  </span>
                  <button
                    onClick={() => setShowAddForm(false)}
                    style={{
                      width: 22, height: 22, borderRadius: '6px', border: 'none',
                      background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Name */}
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Nombre de la materia"
                    style={{ ...inputStyle, width: '100%' }}
                    autoFocus
                  />

                  {/* Row: Year, Semester, Category */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '3px' }}>Año</label>
                      <div style={{ position: 'relative' }}>
                        <select value={newYear} onChange={e => setNewYear(Number(e.target.value))} style={{ ...selectStyle, width: '100%', paddingRight: '24px' }}>
                          {YEARS.map(y => <option key={y} value={y}>{y}° Año</option>)}
                        </select>
                        <ChevronDown size={10} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '3px' }}>Cuatrimestre</label>
                      <div style={{ position: 'relative' }}>
                        <select value={newSemester} onChange={e => setNewSemester(Number(e.target.value))} style={{ ...selectStyle, width: '100%', paddingRight: '24px' }}>
                          {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <ChevronDown size={10} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative' }}>
                      <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '3px' }}>Categoría</label>
                      <div style={{ position: 'relative' }}>
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ ...selectStyle, width: '100%', paddingRight: '24px' }}>
                          <option value="">Elegir categoría...</option>
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value={OTRAS_CAT}>Otra (escribir)</option>
                        </select>
                        <ChevronDown size={10} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {newSemester === 0 && (
                    <p style={{ fontSize: '10px', color: 'rgba(251,191,36,0.85)', margin: 0 }}>
                      Se guardará como materia anual.
                    </p>
                  )}

                  {newCategory === OTRAS_CAT && (
                    <div>
                      <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '3px' }}>Nombre de la categoría</label>
                      <input
                        value={newCategoryCustom}
                        onChange={e => setNewCategoryCustom(e.target.value)}
                        placeholder="Ej: Prácticas, Idiomas..."
                        style={{ ...inputStyle, width: '100%' }}
                      />
                    </div>
                  )}

                  {/* Cuenta para el título (personalizable: el usuario escribe el nombre del título o título intermedio) */}
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px' }}>
                      Cuenta para el título
                    </label>
                    <input
                      value={newTitleName}
                      onChange={e => setNewTitleName(e.target.value)}
                      placeholder="Ej: Analista, Ingeniería, Técnico, Lic. en..."
                      style={{ ...inputStyle, width: '100%' }}
                    />
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
                      Escribí el título o título intermedio de tu carrera 
                    </p>
                  </div>

                  {/* Correlatives multi-select */}
                  {subjects.length > 0 && (
                    <div>
                      <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '4px' }}>
                        Correlativas (tocá para seleccionar)
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '80px', overflow: 'auto' }}>
                        {subjects.map(s => (
                          <button
                            key={s.subject_id}
                            onClick={() => toggleCorrelative(s.subject_id)}
                            style={{
                              padding: '3px 8px', borderRadius: '4px',
                              border: newCorrelatives.includes(s.subject_id) ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                              background: newCorrelatives.includes(s.subject_id) ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                              color: newCorrelatives.includes(s.subject_id) ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.35)',
                              fontSize: '9px', fontWeight: 500, cursor: 'pointer',
                              fontFamily: "'Syne', sans-serif",
                            }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add button */}
                  <button
                    onClick={addSubject}
                    disabled={!canAddSubject}
                    style={{
                      padding: '8px', borderRadius: '6px', border: 'none',
                      background: canAddSubject ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                      color: canAddSubject ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.15)',
                      fontSize: '11px', fontWeight: 600, cursor: canAddSubject ? 'pointer' : 'not-allowed',
                      fontFamily: "'Syne', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}
                  >
                    <Plus size={12} /> Agregar materia
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add button (main) */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '1px dashed rgba(255,255,255,0.08)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '12px', fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontFamily: "'Syne', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = 'rgba(59,130,246,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
            >
              <Plus size={14} /> Agregar materia
            </button>
          )}

          {/* Summary */}
          {subjects.length > 0 && (
            <div style={{
              marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              fontSize: '10px', color: 'rgba(255,255,255,0.3)',
              display: 'flex', gap: '16px',
            }}>
              <span>{subjects.length} materias</span>
              <span>{subjects.filter(s => s.is_analyst).length} de analista</span>
              <span>{new Set(subjects.map(s => s.category)).size} categorías</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: rgb(20, 20, 28); color: rgba(255,255,255,0.85); }
      `}</style>
    </div>
  );
};
