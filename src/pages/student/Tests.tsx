import { useState, useEffect } from 'react';
import { Search, Clock, Award, Play, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { testService } from '@/services/testService';
import type { Test, Question } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// ─── Inline Button ──────────────────────────────
const Btn = ({ children, onClick, disabled = false, variant = 'primary', style: extraStyle = {} }: any) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, ...extraStyle,
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#C8102E', color: 'white', boxShadow: '0 2px 8px rgba(200,16,46,0.25)' },
    secondary: { background: '#f3f4f6', color: '#374151' },
    outline: { background: 'white', color: '#374151', border: '1.5px solid #e5e7eb' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...styles[variant] }}>
      {children}
    </button>
  );
};

export const StudentTests = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTests(); fetchMyResults(); }, []);
  useEffect(() => {
    let filtered = tests;
    if (searchTerm) filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredTests(filtered);
  }, [tests, searchTerm]);
  useEffect(() => {
    if (timeLeft > 0 && showTestModal) {
      const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { handleSubmitTest(); return 0; } return p - 1; }), 1000);
      return () => clearInterval(t);
    }
  }, [timeLeft, showTestModal]);

  const fetchTests = async () => {
    try { const data = await testService.getAll(); setTests(data); }
    catch { toast.error('Failed to fetch tests'); }
    finally { setLoading(false); }
  };
  const fetchMyResults = async () => {
    if (!user) return;
    try { const data = await testService.getResults(user.id); setMyResults(data); }
    catch { /* silent */ }
  };

  const handleStartTest = async (test: Test) => {
    try {
      const qs = await testService.getQuestions(test.id);
      if (!qs.length) { toast.error('No questions available'); return; }
      setSelectedTest(test); setQuestions(qs); setTimeLeft(test.duration * 60);
      setAnswers({}); setCurrentIdx(0); setShowTestModal(true);
    } catch { toast.error('Failed to start test'); }
  };

  const handleSubmitTest = async () => {
    if (!user || !selectedTest) return;
    setIsSubmitting(true);
    try {
      let correct = 0, wrong = 0, unanswered = 0, score = 0;
      questions.forEach(q => {
        const a = answers[q.id];
        if (!a) unanswered++;
        else if (a === q.correct_answer) { correct++; score += q.marks; }
        else { wrong++; if (selectedTest.negative_marking) score -= selectedTest.negative_marks; }
      });
      const timeTaken = selectedTest.duration * 60 - timeLeft;
      const result = await testService.submitTest({ test_id: selectedTest.id, user_id: user.id, score, total_marks: selectedTest.total_marks, correct_answers: correct, wrong_answers: wrong, unanswered, time_taken: timeTaken, answers });
      toast.success('Test submitted!');
      setShowTestModal(false);
      fetchMyResults();
      const full = await testService.getResultById(result.id);
      setSelectedResult(full); setShowResultModal(true);
    } catch { toast.error('Failed to submit test'); }
    finally { setIsSubmitting(false); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const currentQ = questions[currentIdx];
  const isWarning = timeLeft < 60 && timeLeft > 0;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f4f6', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Tests</h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Take tests and track your performance</p>
        </div>
        {myResults.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Completed', value: myResults.length, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Avg Score', value: `${Math.round(myResults.reduce((s, r) => s + (r.score / r.total_marks) * 100, 0) / myResults.length)}%`, color: '#10b981', bg: '#ecfdf5' },
              { label: 'Correct Ans', value: myResults.reduce((s, r) => s + r.correct_answers, 0), color: '#8b5cf6', bg: '#f5f3ff' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 80 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '3px 0 0' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '11px 12px 11px 40px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Test Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filteredTests.map(test => {
          const attempt = myResults.find(r => r.test_id === test.id);
          const pct = attempt ? Math.round((attempt.score / attempt.total_marks) * 100) : null;
          return (
            <div
              key={test.id}
              style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Color top bar */}
              <div style={{ height: 5, background: attempt ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #C8102E, #E6324B)' }} />
              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{test.title}</h3>
                {test.description && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{test.description}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ icon: <Clock size={13} />, label: `${test.duration} min` }, { icon: <Award size={13} />, label: `${test.total_marks} marks` }].map(({ icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f9fafb', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#6b7280' }}>
                      {icon}<span>{label}</span>
                    </div>
                  ))}
                </div>

                {attempt && pct !== null && (
                  <div style={{ background: pct >= (test.passing_marks / test.total_marks * 100) ? '#ecfdf5' : '#fff1f2', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#6b7280' }}>Your score</span>
                      <span style={{ fontWeight: 800, color: pct >= 50 ? '#10b981' : '#ef4444' }}>{attempt.score}/{attempt.total_marks} ({pct}%)</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 50 ? '#10b981' : '#ef4444', borderRadius: 99 }} />
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                  Pass: {test.passing_marks} marks • {test.negative_marking ? '−ve marking' : 'No negative'}
                </p>
              </div>
              <div style={{ padding: '0 18px 18px' }}>
                <Btn onClick={() => handleStartTest(test)} extraStyle={{ width: '100%' }}>
                  <Play size={14} />
                  {attempt ? 'Retake Test' : 'Start Test'}
                </Btn>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No tests found</p>
        </div>
      )}

      {/* ── Test-Taking Modal ── */}
      {showTestModal && currentQ && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isWarning ? '#fff1f2' : '#f9fafb' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{selectedTest?.title}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Q{currentIdx + 1} of {questions.length} • {Object.keys(answers).length} answered</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isWarning ? '#C8102E' : '#1f2937', color: 'white', borderRadius: 10, padding: '8px 14px' }}>
                <Clock size={16} />
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: 'monospace' }}>{fmt(timeLeft)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: '#f3f4f6' }}>
              <div style={{ height: '100%', width: `${((currentIdx + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #C8102E, #E6324B)', transition: 'width 0.3s ease' }} />
            </div>

            {/* Question area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
                <span style={{ background: '#C8102E', color: 'white', fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>Q{currentIdx + 1}</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.6 }}>{currentQ.question_text}</p>
                <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginLeft: 'auto' }}>{currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(['a', 'b', 'c', 'd'] as const).map(opt => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <label
                      key={opt}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12, border: `2px solid ${isSelected ? '#C8102E' : '#e5e7eb'}`, background: isSelected ? '#fff1f2' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      <input
                        type="radio"
                        name={currentQ.id}
                        value={opt}
                        checked={isSelected}
                        onChange={e => setAnswers(p => ({ ...p, [currentQ.id]: e.target.value }))}
                        style={{ marginTop: 2 }}
                      />
                      <span style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                        <strong style={{ color: '#C8102E' }}>{opt.toUpperCase()}) </strong>
                        {currentQ[`option_${opt}` as keyof Question] as string}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigation + Question grid */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              {/* Question number dots */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(i)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: i === currentIdx ? '#C8102E' : answers[q.id] ? '#10b981' : '#e5e7eb', color: i === currentIdx || answers[q.id] ? 'white' : '#6b7280', transition: 'all 0.15s' }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <Btn variant="secondary" onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0}>
                  <ChevronLeft size={16} /> Prev
                </Btn>
                <div style={{ display: 'flex', gap: 10 }}>
                  {currentIdx < questions.length - 1
                    ? <Btn onClick={() => setCurrentIdx(p => p + 1)}>Next <ChevronRight size={16} /></Btn>
                    : <Btn onClick={handleSubmitTest} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Test'}</Btn>}
                  <Btn variant="outline" onClick={() => { if (confirm('Exit? Progress lost.')) setShowTestModal(false); }}>Exit</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Modal ── */}
      {showResultModal && selectedResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              {selectedResult.score >= (selectedTest?.passing_marks || 0)
                ? <CheckCircle size={56} color="#10b981" style={{ display: 'block', margin: '0 auto 12px' }} />
                : <XCircle size={56} color="#ef4444" style={{ display: 'block', margin: '0 auto 12px' }} />
              }
              <p style={{ fontSize: 40, fontWeight: 900, color: '#C8102E', margin: 0, lineHeight: 1 }}>{selectedResult.score}/{selectedResult.total_marks}</p>
              <p style={{ fontSize: 16, color: '#6b7280', margin: '6px 0 0' }}>{((selectedResult.score / selectedResult.total_marks) * 100).toFixed(1)}%</p>
              <span style={{ display: 'inline-block', marginTop: 10, padding: '4px 16px', borderRadius: 99, fontWeight: 700, fontSize: 13, background: selectedResult.score >= (selectedTest?.passing_marks || 0) ? '#ecfdf5' : '#fff1f2', color: selectedResult.score >= (selectedTest?.passing_marks || 0) ? '#065f46' : '#991b1b' }}>
                {selectedResult.score >= (selectedTest?.passing_marks || 0) ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[{ label: 'Correct', value: selectedResult.correct_answers, color: '#10b981', bg: '#ecfdf5' }, { label: 'Wrong', value: selectedResult.wrong_answers, color: '#ef4444', bg: '#fff1f2' }, { label: 'Skipped', value: selectedResult.unanswered, color: '#6b7280', bg: '#f3f4f6' }].map(item => (
                <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: '12px 8px' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{item.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
              Time: {Math.floor(selectedResult.time_taken / 60)}m {selectedResult.time_taken % 60}s
            </p>
            <Btn onClick={() => setShowResultModal(false)} extraStyle={{ width: '100%' }}>Close</Btn>
          </div>
        </div>
      )}
    </div>
  );
};
