import { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { quizService } from '@/services/quizService';
import type { QuizCategory, QuizQuestion } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const categoryIcons: Record<string, string> = {
  'Mathematics': '📐',
  'English': '📖',
  'General Knowledge': '🌍',
  'Reasoning': '🧠',
  'Current Affairs': '📰',
  'Science': '🔬',
  'Postal Rules': '📜',
  'Department Circulars': '📋',
  'Exam Preparation': '🎯',
  'Mock Tests': '📝',
  'default': '📚',
};

const difficultyStyle: Record<string, { bg: string; color: string }> = {
  easy: { bg: '#ecfdf5', color: '#16a34a' },
  medium: { bg: '#fffbeb', color: '#d97706' },
  hard: { bg: '#fff1f2', color: '#dc2626' },
};

export const StudentQuiz = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [answeredSet, setAnsweredSet] = useState<Set<number>>(new Set());
  const [myStats, setMyStats] = useState<any>(null);

  useEffect(() => { fetchCategories(); fetchMyStats(); }, []);

  const fetchCategories = async () => {
    try { const data = await quizService.getCategories(); setCategories(data); }
    catch { toast.error('Failed to load categories'); }
  };
  const fetchMyStats = async () => {
    if (!user) return;
    try { const stats = await quizService.getUserStats(user.id); setMyStats(stats); }
    catch { /* silent */ }
  };

  const handleStartQuiz = async (cat: QuizCategory) => {
    try {
      const qs = await quizService.getRandomQuestions(cat.id, 10);
      if (!qs.length) { toast.error('No questions available'); return; }
      setSelectedCategory(cat); setQuestions(qs); setCurrentIdx(0);
      setSelectedAnswer(''); setShowResult(false); setScore(0);
      setCorrectCount(0); setAnsweredSet(new Set());
      setShowQuizModal(true);
    } catch { toast.error('Failed to start quiz'); }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) { toast.error('Please select an answer'); return; }
    const q = questions[currentIdx];
    const correct = selectedAnswer === q.correct_answer;
    if (correct) { setScore(p => p + 1); setCorrectCount(p => p + 1); }
    setAnsweredSet(p => new Set(p).add(currentIdx));

    if (currentIdx >= questions.length - 1) {
      setTimeout(() => handleFinishQuiz(correct), 1200);
    }
  };

  const handleNext = () => {
    setCurrentIdx(p => p + 1);
    setSelectedAnswer('');
  };

  const handleFinishQuiz = async (lastCorrect: boolean) => {
    if (!user || !selectedCategory) return;
    const finalScore = lastCorrect ? score + 1 : score;
    const finalCorrect = lastCorrect ? correctCount + 1 : correctCount;
    try {
      await quizService.submitQuiz({
        category_id: selectedCategory.id, user_id: user.id,
        score: finalScore, total_questions: questions.length,
        correct_answers: finalCorrect, wrong_answers: questions.length - finalCorrect,
        accuracy: (finalCorrect / questions.length) * 100,
      });
      setShowResult(true); fetchMyStats();
    } catch { toast.error('Failed to save result'); }
  };

  const handleClose = () => { setShowQuizModal(false); setSelectedCategory(null); setQuestions([]); setShowResult(false); };

  const currentQ = questions[currentIdx];
  const isAnswered = answeredSet.has(currentIdx);
  const accuracy = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 }}>Quiz Practice</h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Practice and improve your skills</p>
      </div>

      {/* Stats Bar */}
      {myStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Attempts', value: myStats.totalAttempts, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Correct Answers', value: myStats.totalCorrect, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Questions Done', value: myStats.totalQuestions, color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Avg Accuracy', value: `${myStats.averageAccuracy.toFixed(1)}%`, color: '#f59e0b', bg: '#fffbeb' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Cards */}
      <div>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#374151', margin: '0 0 14px' }}>Choose a Category</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {categories.map(cat => {
            const iconSymbol = cat.icon || categoryIcons[cat.name] || categoryIcons['default'];
            return (
              <div
                key={cat.id}
                onClick={() => handleStartQuiz(cat)}
                style={{
                  background: 'white',
                  borderRadius: 18,
                  border: '2px solid #f0f0f0',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  minHeight: 150,
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C8102E';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 28px rgba(200,16,46,0.18)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    fontSize: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {iconSymbol}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: '#111827', margin: 0, lineHeight: 1.3 }}>{cat.name}</p>
                    {cat.description && <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.4 }}>{cat.description}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>10 random questions</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C8102E', fontWeight: 800, fontSize: 14 }}>
                    Start <ChevronRight size={17} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quiz Modal ── */}
      {showQuizModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

            {!showResult && currentQ ? (
              <>
                {/* Modal Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>{selectedCategory?.name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Q{currentIdx + 1} of {questions.length}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', borderRadius: 10, padding: '8px 14px' }}>
                    <Award size={16} color="#10b981" />
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#10b981' }}>{score}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: '#f3f4f6' }}>
                  <div style={{ height: '100%', width: `${((currentIdx + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #C8102E, #E6324B)', transition: 'width 0.3s' }} />
                </div>

                {/* Question */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <span style={{ background: '#C8102E', color: 'white', fontWeight: 800, fontSize: 11, padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>Q{currentIdx + 1}</span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, flexShrink: 0, marginLeft: 'auto', background: difficultyStyle[currentQ.difficulty]?.bg || '#f3f4f6', color: difficultyStyle[currentQ.difficulty]?.color || '#6b7280', fontWeight: 600 }}>
                      {currentQ.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20, lineHeight: 1.6 }}>{currentQ.question_text}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(['a', 'b', 'c', 'd'] as const).map(opt => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === currentQ.correct_answer;
                      let borderColor = '#e5e7eb', bg = 'white';
                      if (isAnswered) {
                        if (isCorrect) { borderColor = '#10b981'; bg = '#ecfdf5'; }
                        else if (isSelected) { borderColor = '#ef4444'; bg = '#fff1f2'; }
                      } else if (isSelected) { borderColor = '#C8102E'; bg = '#fff1f2'; }

                      return (
                        <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', borderRadius: 12, border: `2px solid ${borderColor}`, background: bg, cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.15s', pointerEvents: isAnswered ? 'none' : 'auto' }}>
                          <input type="radio" name="quiz-ans" value={opt} checked={isSelected} onChange={e => setSelectedAnswer(e.target.value)} disabled={isAnswered} style={{ marginTop: 2 }} />
                          <span style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                            <strong style={{ color: isAnswered && isCorrect ? '#10b981' : '#C8102E' }}>{opt.toUpperCase()}) </strong>
                            {currentQ[`option_${opt}` as keyof QuizQuestion] as string}
                          </span>
                          {isAnswered && isCorrect && <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />}
                          {isAnswered && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />}
                        </label>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {isAnswered && currentQ.explanation && (
                    <div style={{ marginTop: 16, padding: '14px 16px', background: '#eff6ff', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <BookOpen size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 12, color: '#2563eb', margin: '0 0 4px' }}>Explanation</p>
                        <p style={{ fontSize: 13, color: '#1d4ed8', margin: 0, lineHeight: 1.5 }}>{currentQ.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <button onClick={handleClose} style={{ background: 'none', border: '1.5px solid #e5e7eb', color: '#6b7280', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Exit</button>
                  {!isAnswered
                    ? <button onClick={handleAnswerSubmit} disabled={!selectedAnswer} style={{ background: selectedAnswer ? '#C8102E' : '#f3f4f6', color: selectedAnswer ? 'white' : '#9ca3af', border: 'none', padding: '10px 24px', borderRadius: 10, cursor: selectedAnswer ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}>Submit Answer</button>
                    : currentIdx < questions.length - 1
                      ? <button onClick={handleNext} style={{ background: '#C8102E', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>Next <ChevronRight size={16} /></button>
                      : null
                  }
                </div>
              </>
            ) : showResult ? (
              /* Result Screen */
              <div style={{ padding: 32, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8102E' }}><Award size={36} /></div>
                <div>
                  <p style={{ fontSize: 48, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1 }}>{score}/{questions.length}</p>
                  <p style={{ fontSize: 18, color: '#C8102E', fontWeight: 700, margin: '4px 0 0' }}>{accuracy}% Accuracy</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 280 }}>
                  {[{ label: 'Correct', value: correctCount, color: '#10b981', bg: '#ecfdf5' }, { label: 'Wrong', value: questions.length - correctCount, color: '#ef4444', bg: '#fff1f2' }].map(item => (
                    <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: '14px 0' }}>
                      <p style={{ fontSize: 26, fontWeight: 900, color: item.color, margin: 0 }}>{item.value}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button onClick={handleClose} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
                  <button onClick={() => selectedCategory && handleStartQuiz(selectedCategory)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#C8102E', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
