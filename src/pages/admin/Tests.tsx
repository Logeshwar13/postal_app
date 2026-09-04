import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Eye, Clock, Award, CheckCircle2 } from 'lucide-react';
import { testService } from '@/services/testService';
import type { Test, Question } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export const AdminTests = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: false,
    negative_marks: 0.25,
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as 'a' | 'b' | 'c' | 'd',
    marks: 1,
    explanation: '',
  });

  useEffect(() => { fetchTests(); }, []);
  useEffect(() => {
    let f = tests;
    if (searchTerm) f = f.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredTests(f);
  }, [tests, searchTerm]);

  const fetchTests = async () => {
    try {
      const data = await testService.getAllAdmin();
      setTests(data);
    } catch { toast.error('Failed to fetch tests'); }
    finally { setIsLoading(false); }
  };

  const handleToggleActive = async (test: Test) => {
    try {
      await testService.toggleActive(test.id, !test.is_active);
      toast.success(`Test is now ${!test.is_active ? 'Public' : 'Private'}`);
      fetchTests();
    } catch { toast.error('Failed to update test visibility'); }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await testService.create({ ...formData, created_by: user.id, is_active: true });
      toast.success('Test created!');
      setShowModal(false);
      resetForm();
      fetchTests();
    } catch { toast.error('Failed to create test'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await testService.delete(id);
      toast.success('Test deleted');
      fetchTests();
    } catch { toast.error('Failed to delete test'); }
  };

  const handleViewQuestions = async (test: Test) => {
    setSelectedTest(test);
    try {
      const data = await testService.getQuestions(test.id);
      setQuestions(data);
      setShowQuestionsModal(true);
    } catch { toast.error('Failed to fetch questions'); }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    setIsSaving(true);
    try {
      await testService.addQuestion({ test_id: selectedTest.id, ...questionForm });
      toast.success('Question added!');
      resetQuestionForm();
      const data = await testService.getQuestions(selectedTest.id);
      setQuestions(data);
    } catch { toast.error('Failed to add question'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await testService.deleteQuestion(id);
      toast.success('Question deleted');
      if (selectedTest) {
        const data = await testService.getQuestions(selectedTest.id);
        setQuestions(data);
      }
    } catch { toast.error('Failed to delete question'); }
  };

  const resetForm = () => setFormData({ title: '', description: '', duration: 60, total_marks: 100, passing_marks: 40, negative_marking: false, negative_marks: 0.25 });
  const resetQuestionForm = () => setQuestionForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a', marks: 1, explanation: '' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Tests Management</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Create, view, and manage student tests</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(200,16,46,0.25)' }}>
          <Plus size={18} /> Create Test
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search tests..." style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredTests.map(test => (
            <div key={test.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 4, background: test.is_active ? 'linear-gradient(90deg, #C8102E, #E6324B)' : '#e5e7eb', position: 'absolute', top: 0, left: 0, right: 0 }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{test.title}</h3>
                  <button
                    onClick={() => handleToggleActive(test)}
                    title="Click to toggle Public / Private visibility"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 99,
                      border: 'none',
                      cursor: 'pointer',
                      background: test.is_active ? '#ecfdf5' : '#f3f4f6',
                      color: test.is_active ? '#16a34a' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.2s',
                    }}
                  >
                    {test.is_active ? '🟢 Public' : '🔒 Private'}
                  </button>
                </div>
                {test.description && <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{test.description}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f9fafb', borderRadius: 10, padding: 10, fontSize: 12, color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color="#6b7280" /><span>{test.duration} mins</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Award size={14} color="#6b7280" /><span>{test.total_marks} marks</span></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                <span>Pass: <b>{test.passing_marks}</b></span>
                <span>Created: {formatDate(test.created_at)}</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleViewQuestions(test)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#111827', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Eye size={14} /> Questions
                </button>
                <button onClick={() => handleDelete(test.id)} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {filteredTests.length === 0 && <div style={{ textAlign: 'center', padding: '48px 0', gridColumn: '1 / -1' }}><p style={{ color: '#9ca3af', fontSize: 14 }}>No tests found</p></div>}
        </div>
      )}

      {/* Create Test Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: '0 0 20px' }}>Create New Test</h3>
            <form onSubmit={handleCreateTest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Test Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Postal Manual Volume V Mock Test" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Enter test instructions or topic details..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Duration (mins)</label>
                  <input type="number" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Total Marks</label>
                  <input type="number" required value={formData.total_marks} onChange={e => setFormData({ ...formData, total_marks: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Passing Marks</label>
                  <input type="number" required value={formData.passing_marks} onChange={e => setFormData({ ...formData, passing_marks: Number(e.target.value) })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Negative Marking</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={formData.negative_marking} onChange={e => setFormData({ ...formData, negative_marking: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C8102E' }} />
                    Enable (0.25 deduction)
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Creating...' : 'Create Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#111827', margin: 0 }}>Questions ({questions.length})</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{selectedTest.title}</p>
              </div>
              <button onClick={() => { setShowQuestionsModal(false); setSelectedTest(null); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Close</button>
            </div>

            {/* Add question form */}
            <form onSubmit={handleAddQuestion} style={{ background: '#f9fafb', borderRadius: 14, padding: 18, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Add New Question</p>
              <textarea required value={questionForm.question_text} onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })} placeholder="Question text..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['a', 'b', 'c', 'd'] as const).map(opt => (
                  <input key={opt} required value={questionForm[`option_${opt}` as keyof typeof questionForm] as string} onChange={e => setQuestionForm({ ...questionForm, [`option_${opt}`]: e.target.value })} placeholder={`Option ${opt.toUpperCase()}`} style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Correct Option</label>
                  <select value={questionForm.correct_answer} onChange={e => setQuestionForm({ ...questionForm, correct_answer: e.target.value as any })} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Marks</label>
                  <input type="number" required value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" disabled={isSaving} style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: '#C8102E', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{isSaving ? 'Adding...' : '+ Add Question'}</button>
                </div>
              </div>
            </form>

            {/* Questions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: 0 }}>Q{idx + 1}. {q.question_text}</p>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 2 }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                    {(['a', 'b', 'c', 'd'] as const).map(opt => {
                      const isCorrect = q.correct_answer === opt;
                      const text = q[`option_${opt}` as keyof Question];
                      return (
                        <div key={opt} style={{ padding: '6px 10px', borderRadius: 6, background: isCorrect ? '#ecfdf5' : '#f9fafb', color: isCorrect ? '#16a34a' : '#4b5563', fontWeight: isCorrect ? 700 : 400, border: isCorrect ? '1px solid #6ee7b7' : '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isCorrect ? <CheckCircle2 size={12} color="#16a34a" /> : <span style={{ opacity: 0.5 }}>{opt.toUpperCase()})</span>} {text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {questions.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '24px 0' }}>No questions added yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
