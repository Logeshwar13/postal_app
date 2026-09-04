import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import { quizService } from '@/services/quizService';
import type { QuizCategory, QuizQuestion } from '@/types';
import toast from 'react-hot-toast';

export const AdminQuiz = () => {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as 'a' | 'b' | 'c' | 'd',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const data = await quizService.getCategoriesAdmin(); setCategories(data); }
    catch { toast.error('Failed to fetch categories'); }
  };

  const handleTogglePublic = async (e: React.MouseEvent, cat: QuizCategory) => {
    e.stopPropagation();
    const nextStatus = cat.is_public === false ? true : false;
    try {
      await quizService.togglePublic(cat.id, nextStatus);
      toast.success(`Category is now ${nextStatus ? 'Public' : 'Private'}`);
      fetchCategories();
    } catch { toast.error('Failed to update category visibility'); }
  };

  const fetchQuestions = async (categoryId: string) => {
    try { const data = await quizService.getQuestions(categoryId); setQuestions(data); }
    catch { toast.error('Failed to fetch questions'); }
  };

  const handleSelectCategory = (category: QuizCategory) => {
    setSelectedCategory(category);
    fetchQuestions(category.id);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSaving(true);
    try {
      await quizService.addQuestion({ category_id: selectedCategory.id, ...questionForm });
      toast.success('Question added!');
      resetForm();
      setShowModal(false);
      fetchQuestions(selectedCategory.id);
    } catch { toast.error('Failed to add question'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await quizService.deleteQuestion(id);
      toast.success('Question deleted');
      if (selectedCategory) fetchQuestions(selectedCategory.id);
    } catch { toast.error('Failed to delete question'); }
  };

  const resetForm = () => setQuestionForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', explanation: '', difficulty: 'medium' });

  const filteredQuestions = questions.filter(q => q.question_text.toLowerCase().includes(searchTerm.toLowerCase()));

  const diffBadge = (d: string) => {
    if (d === 'easy') return { bg: '#ecfdf5', text: '#16a34a' };
    if (d === 'hard') return { bg: '#fff1f2', text: '#dc2626' };
    return { bg: '#fffbeb', text: '#d97706' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Quiz Management</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Manage daily quiz categories and practice questions</p>
        </div>
      </div>

      {!selectedCategory ? (
        /* Categories View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {categories.map(cat => {
            const isPublic = cat.is_public !== false;
            return (
              <div key={cat.id} onClick={() => handleSelectCategory(cat)}
                style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
              >
                <button
                  onClick={e => handleTogglePublic(e, cat)}
                  title="Click to toggle Public / Private visibility"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 99,
                    border: 'none',
                    cursor: 'pointer',
                    background: isPublic ? '#ecfdf5' : '#f3f4f6',
                    color: isPublic ? '#16a34a' : '#6b7280',
                  }}
                >
                  {isPublic ? '🟢 Public' : '🔒 Private'}
                </button>

                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8102E', margin: '0 auto' }}>
                  <BookOpen size={24} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{cat.name}</h3>
                {cat.description && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{cat.description}</p>}
                <button style={{ marginTop: 'auto', padding: '8px 0', borderRadius: 8, border: '1.5px solid #C8102E', background: 'white', color: '#C8102E', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Manage Questions →</button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Category Detail View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSelectedCategory(null)} style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: 0 }}>{selectedCategory.name}</h2>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{questions.length} questions available</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} /> Add Question
            </button>
          </div>

          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search questions..." style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredQuestions.map((q, idx) => {
              const diff = diffBadge(q.difficulty);
              return (
                <div key={q.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Q{idx + 1}.</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: diff.bg, color: diff.text, textTransform: 'capitalize' }}>{q.difficulty}</span>
                    </div>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 2 }}><Trash2 size={16} /></button>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.5 }}>{q.question_text}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['a', 'b', 'c', 'd'] as const).map(opt => {
                      const isCorrect = q.correct_answer === opt;
                      const text = q[`option_${opt}` as keyof QuizQuestion];
                      return (
                        <div key={opt} style={{ padding: '8px 12px', borderRadius: 8, background: isCorrect ? '#ecfdf5' : '#f9fafb', color: isCorrect ? '#16a34a' : '#4b5563', fontWeight: isCorrect ? 700 : 400, border: isCorrect ? '1.5px solid #6ee7b7' : '1px solid #f3f4f6', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isCorrect ? <CheckCircle2 size={14} color="#16a34a" /> : <span style={{ color: '#9ca3af', fontWeight: 600 }}>{opt.toUpperCase()})</span>}
                          {text}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2563eb', borderLeft: '3px solid #3b82f6' }}>
                      💡 <b>Explanation:</b> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredQuestions.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, padding: '40px 0' }}>No questions found in this category</p>}
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 16px' }}>Add Question to {selectedCategory?.name}</h3>
            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Question</label>
                <textarea required value={questionForm.question_text} onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })} placeholder="Enter question..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['a', 'b', 'c', 'd'] as const).map(opt => (
                  <input key={opt} required value={questionForm[`option_${opt}` as keyof typeof questionForm] as string} onChange={e => setQuestionForm({ ...questionForm, [`option_${opt}`]: e.target.value })} placeholder={`Option ${opt.toUpperCase()}`} style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Correct Option</label>
                  <select value={questionForm.correct_answer} onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value as any })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                    <option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Difficulty</label>
                  <select value={questionForm.difficulty} onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value as any })} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Explanation (Optional)</label>
                <textarea value={questionForm.explanation} onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })} placeholder="Explanation for correct answer..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving...' : 'Add Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
