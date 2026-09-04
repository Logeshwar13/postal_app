import { supabase } from '@/supabase/client';

export interface Certificate {
  id: string;
  user_id: string;
  type: 'test_completion' | 'course_completion' | 'quiz_mastery';
  title: string;
  description: string;
  score: number;
  issued_date: string;
  certificate_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const certificateService = {
  async getAll(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_date', { ascending: false });

    if (error) throw error;
    return data as Certificate[];
  },

  async getById(id: string): Promise<Certificate> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Certificate;
  },

  async issueCertificate(
    userId: string,
    type: Certificate['type'],
    title: string,
    description: string,
    score: number,
    metadata: Record<string, any> = {}
  ): Promise<Certificate> {
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        type,
        title,
        description,
        score,
        certificate_id: certificateId,
        issued_date: new Date().toISOString(),
        metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Certificate;
  },

  async checkAndIssueCertificates(userId: string) {
    // Check for test completion certificates
    const { data: testResults } = await supabase
      .from('test_results')
      .select(`
        *,
        tests (
          title,
          total_marks,
          passing_marks
        )
      `)
      .eq('user_id', userId);

    const passedTests = (testResults || []).filter((result: any) => {
      const percentage = (result.score / result.tests.total_marks) * 100;
      return percentage >= 60; // Passing threshold
    });

    // Issue certificates for passed tests
    for (const result of passedTests) {
      // Check if certificate already exists
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'test_completion')
        .eq('metadata->>test_id', result.test_id)
        .single();

      if (!existing) {
        await this.issueCertificate(
          userId,
          'test_completion',
          `Certificate of Completion: ${result.tests.title}`,
          `Successfully completed ${result.tests.title} with a score of ${result.score}/${result.tests.total_marks}`,
          result.score,
          {
            test_id: result.test_id,
            test_title: result.tests.title,
            total_marks: result.tests.total_marks,
          }
        );
      }
    }

    // Check for quiz mastery certificates
    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .gte('accuracy', 85); // 85% accuracy for mastery

    const categoriesWithMastery = new Set(
      (quizResults || []).map((r: any) => r.category_id)
    );

    for (const categoryId of categoriesWithMastery) {
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'quiz_mastery')
        .eq('metadata->>category_id', categoryId)
        .single();

      if (!existing) {
        const categoryQuizzes = (quizResults || []).filter(
          (r: any) => r.category_id === categoryId
        );
        const avgAccuracy =
          categoryQuizzes.reduce((sum: number, r: any) => sum + r.accuracy, 0) /
          categoryQuizzes.length;

        await this.issueCertificate(
          userId,
          'quiz_mastery',
          `Quiz Mastery Certificate`,
          `Demonstrated mastery with ${avgAccuracy.toFixed(1)}% average accuracy`,
          Math.round(avgAccuracy),
          {
            category_id: categoryId,
            total_quizzes: categoryQuizzes.length,
            average_accuracy: avgAccuracy,
          }
        );
      }
    }

    // Check for course completion (all tests passed)
    if (passedTests.length >= 5) {
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'course_completion')
        .single();

      if (!existing) {
        const avgScore =
          passedTests.reduce((sum, r: any) => sum + r.score, 0) / passedTests.length;

        await this.issueCertificate(
          userId,
          'course_completion',
          'GDS Training Course Completion',
          `Successfully completed the GDS Training Program with ${passedTests.length} tests passed`,
          Math.round(avgScore),
          {
            total_tests: passedTests.length,
            average_score: avgScore,
          }
        );
      }
    }
  },

  async deleteCertificate(id: string) {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  generateCertificateHTML(certificate: Certificate, userName: string): string {
    const date = new Date(certificate.issued_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: landscape; margin: 0; }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .certificate {
      width: 297mm;
      height: 210mm;
      padding: 50px;
      background: white;
      position: relative;
      box-sizing: border-box;
    }
    .border {
      border: 10px solid #C8102E;
      padding: 40px;
      height: 100%;
      position: relative;
    }
    .inner-border {
      border: 2px solid #FFD700;
      padding: 40px;
      height: 100%;
      text-align: center;
    }
    .logo {
      font-size: 48px;
      color: #C8102E;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .title {
      font-size: 54px;
      color: #C8102E;
      font-weight: bold;
      margin: 30px 0;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 24px;
      color: #333;
      margin: 20px 0;
    }
    .recipient {
      font-size: 48px;
      color: #000;
      font-weight: bold;
      margin: 30px 0;
      border-bottom: 2px solid #C8102E;
      display: inline-block;
      padding: 0 50px 10px;
    }
    .description {
      font-size: 20px;
      color: #555;
      margin: 30px auto;
      max-width: 80%;
      line-height: 1.8;
    }
    .score {
      font-size: 36px;
      color: #C8102E;
      font-weight: bold;
      margin: 30px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding: 0 100px;
    }
    .signature {
      text-align: center;
    }
    .signature-line {
      width: 200px;
      border-top: 2px solid #000;
      margin: 0 auto 10px;
    }
    .certificate-id {
      font-size: 14px;
      color: #888;
      position: absolute;
      bottom: 20px;
      right: 50px;
    }
    .date {
      font-size: 18px;
      color: #666;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border">
      <div class="inner-border">
        <div class="logo">DakShiksha</div>
        <div class="title">CERTIFICATE OF ${certificate.type === 'course_completion' ? 'COMPLETION' : certificate.type === 'quiz_mastery' ? 'MASTERY' : 'ACHIEVEMENT'}</div>
        <div class="subtitle">This is to certify that</div>
        <div class="recipient">${userName}</div>
        <div class="description">${certificate.description}</div>
        ${certificate.score ? `<div class="score">Score: ${certificate.score}%</div>` : ''}
        <div class="date">Issued on ${date}</div>
        <div class="footer">
          <div class="signature">
            <div class="signature-line"></div>
            <div>Director</div>
            <div style="font-size: 14px; color: #888;">DakShiksha Training</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>Authorized Signatory</div>
            <div style="font-size: 14px; color: #888;">India Post</div>
          </div>
        </div>
        <div class="certificate-id">Certificate ID: ${certificate.certificate_id}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },
};
