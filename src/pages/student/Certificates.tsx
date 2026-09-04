import { useState, useEffect } from 'react';
import { Award, Download, Eye, FileText, Trophy, Star, Calendar, Share2 } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { certificateService, type Certificate } from '@/services/certificateService';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

export const StudentCertificates = () => {
  const { user } = useAuth();
  const [certificates, setcertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check and issue any pending certificates
      await certificateService.checkAndIssueCertificates(user.id);

      // Fetch all certificates
      const data = await certificateService.getAll(user.id);
      setcertificates(data);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!user) return;

    try {
      const html = certificateService.generateCertificateHTML(certificate, user.full_name || 'Student');
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificate.certificate_id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Certificate downloaded! Open the HTML file in your browser and print as PDF.');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  const handleShare = (certificate: Certificate) => {
    const text = `I just earned a certificate from DakShiksha! ${certificate.title}`;

    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: text,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(text);
        toast.success('Certificate details copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Certificate details copied to clipboard!');
    }
  };

  const getCertificateIcon = (type: Certificate['type']) => {
    switch (type) {
      case 'test_completion':
        return { icon: FileText, color: 'from-blue-500 to-blue-600' };
      case 'quiz_mastery':
        return { icon: Star, color: 'from-purple-500 to-purple-600' };
      case 'course_completion':
        return { icon: Trophy, color: 'from-yellow-500 to-yellow-600' };
    }
  };

  const stats = {
    total: certificates.length,
    test: certificates.filter((c) => c.type === 'test_completion').length,
    quiz: certificates.filter((c) => c.type === 'quiz_mastery').length,
    course: certificates.filter((c) => c.type === 'course_completion').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-8 h-8 text-yellow-500" />
          My Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Download and share your earned certificates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-90">Total Certificates</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.test}</p>
            <p className="text-sm opacity-90">Test Completion</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.quiz}</p>
            <p className="text-sm opacity-90">Quiz Mastery</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.course}</p>
            <p className="text-sm opacity-90">Course Complete</p>
          </div>
        </Card>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading certificates...</p>
          </div>
        </Card>
      ) : certificates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No certificates yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Complete tests and quizzes to earn certificates
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => {
            const { icon: Icon, color } = getCertificateIcon(certificate.type);

            return (
              <Card key={certificate.id} hoverable className="relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${color} opacity-10`} />

                <div className="relative space-y-4">
                  {/* Icon */}
                  <div className="flex justify-center pt-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center px-4">
                    <h3 className="font-bold text-lg mb-2">{certificate.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {certificate.description}
                    </p>
                  </div>

                  {/* Score */}
                  {certificate.score && (
                    <div className="text-center">
                      <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-lg">
                        <p className="text-2xl font-bold">{certificate.score}%</p>
                      </div>
                    </div>
                  )}

                  {/* Certificate ID */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-mono">
                      {certificate.certificate_id}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {formatDate(certificate.issued_date)}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-dark-lighter">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => handlePreview(certificate)}
                      className="text-xs"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => handleDownload(certificate)}
                      className="text-xs"
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Share2 className="w-4 h-4" />}
                      onClick={() => handleShare(certificate)}
                      className="text-xs"
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedCertificate(null);
        }}
        title="Certificate Preview"
        size="xl"
      >
        {selectedCertificate && user && (
          <div className="space-y-6">
            <div
              className="border-8 border-primary p-8 bg-white text-center"
              style={{ minHeight: '400px' }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-primary mb-2">DakShiksha</h1>
              <h2 className="text-2xl font-bold mb-6">
                CERTIFICATE OF{' '}
                {selectedCertificate.type === 'course_completion'
                  ? 'COMPLETION'
                  : selectedCertificate.type === 'quiz_mastery'
                    ? 'MASTERY'
                    : 'ACHIEVEMENT'}
              </h2>
              <p className="text-lg mb-4">This is to certify that</p>
              <h3 className="text-3xl font-bold mb-6 border-b-2 border-primary inline-block px-8 pb-2">
                {user.full_name}
              </h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                {selectedCertificate.description}
              </p>
              {selectedCertificate.score && (
                <p className="text-2xl font-bold text-primary mb-6">
                  Score: {selectedCertificate.score}%
                </p>
              )}
              <p className="text-gray-600 mb-8">
                Issued on {formatDate(selectedCertificate.issued_date)}
              </p>
              <div className="flex justify-around max-w-md mx-auto">
                <div>
                  <div className="w-32 border-t-2 border-black mb-2"></div>
                  <p className="font-semibold">Director</p>
                  <p className="text-sm text-gray-600">DakShiksha Training</p>
                </div>
                <div>
                  <div className="w-32 border-t-2 border-black mb-2"></div>
                  <p className="font-semibold">Authorized Signatory</p>
                  <p className="text-sm text-gray-600">India Post</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-8">
                Certificate ID: {selectedCertificate.certificate_id}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Download className="w-4 h-4" />}
                onClick={() => {
                  handleDownload(selectedCertificate);
                  setShowPreview(false);
                }}
                className="flex-1"
              >
                Download Certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
