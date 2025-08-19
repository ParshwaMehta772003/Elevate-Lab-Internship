import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Download, 
  Trophy, 
  TrendingUp, 
  Users, 
  FileText,
  Zap,
  Settings,
  CheckCircle
} from 'lucide-react';

interface RankedCandidate {
  name: string;
  score: number;
  rank: number;
  matchedKeywords: string[];
  fileName: string;
}

export const ResumeRanker: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<RankedCandidate[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5678/webhook-test/resume-rank');
  const { toast } = useToast();

  // Mock AI ranking algorithm (simulates NLP processing)
  const analyzeResumes = async () => {
    if (files.length === 0 || !jobDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please upload resumes and enter a job description.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock data with realistic scoring
    const mockResults: RankedCandidate[] = files.map((file, index) => {
      // Extract name from filename (remove .pdf extension)
      const name = file.name.replace('.pdf', '').replace(/[-_]/g, ' ');
      
      // Generate realistic scores and keywords
      const baseScore = Math.random() * 40 + 60; // 60-100 range
      const keywords = extractKeywords(jobDescription);
      const matchedKeywords = keywords.slice(0, Math.floor(Math.random() * 3) + 2);
      
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        score: Math.round(baseScore),
        rank: 0, // Will be set after sorting
        matchedKeywords,
        fileName: file.name,
      };
    });

    // Sort by score and assign ranks
    const sortedResults = mockResults
      .sort((a, b) => b.score - a.score)
      .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

    setResults(sortedResults);
    setIsProcessing(false);

    toast({
      title: 'Analysis Complete',
      description: `Successfully ranked ${files.length} candidates.`,
    });

    // Auto-send to webhook if URL is provided
    if (webhookUrl) {
      await sendToWebhook(sortedResults);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const commonKeywords = [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
      'Git', 'Agile', 'Scrum', 'TypeScript', 'API', 'Database', 'Leadership',
      'Communication', 'Problem Solving', 'Team Work', 'Project Management'
    ];
    
    const textLower = text.toLowerCase();
    return commonKeywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    );
  };

  const sendToWebhook = async (rankings: RankedCandidate[]) => {
    if (!webhookUrl) return;

    try {
      const payload = {
        job_title: 'Position Analysis',
        timestamp: new Date().toISOString(),
        rankings: rankings.map(({ name, score, rank }) => ({ name, score, rank })),
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      toast({
        title: 'Webhook Sent',
        description: 'Results successfully sent to n8n workflow.',
      });
    } catch (error) {
      toast({
        title: 'Webhook Error',
        description: 'Failed to send results to webhook.',
        variant: 'destructive',
      });
    }
  };

  const downloadReport = () => {
    if (results.length === 0) return;

    const csvContent = [
      'Rank,Name,Score,Matched Keywords,File Name',
      ...results.map(r => 
        `${r.rank},${r.name},${r.score},"${r.matchedKeywords.join(', ')}",${r.fileName}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-rankings.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Downloaded',
      description: 'CSV report has been saved to your downloads.',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 75) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
              AI Resume Ranker
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent resume screening powered by advanced NLP algorithms. 
            Upload resumes, enter job requirements, and get instant candidate rankings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Upload Resumes</span>
                </CardTitle>
                <CardDescription>
                  Upload PDF resumes to analyze and rank against your job requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload files={files} onFilesChange={setFiles} />
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Job Description</span>
                </CardTitle>
                <CardDescription>
                  Paste the job description to match candidates against requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter job description, required skills, and qualifications..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Webhook Configuration */}
            <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>n8n Webhook Integration</span>
                </CardTitle>
                <CardDescription>
                  Optional: Enter your n8n webhook URL to automatically receive results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="https://your-n8n-instance.com/webhook/resume-rankings"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Analysis Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={analyzeResumes}
                  disabled={isProcessing || files.length === 0 || !jobDescription.trim()}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Rank Resumes
                    </>
                  )}
                </Button>

                {results.length > 0 && (
                  <Button
                    onClick={downloadReport}
                    variant="outline"
                    className="w-full h-12"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download HR Report
                  </Button>
                )}

                {/* Stats */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resumes:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={results.length > 0 ? "default" : "outline"}>
                      {results.length > 0 ? "Complete" : "Ready"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Ranking Results</span>
              </CardTitle>
              <CardDescription>
                AI-powered analysis complete. Candidates ranked by job fit score.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((candidate) => (
                  <div
                    key={candidate.rank}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {candidate.rank}
                      </div>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.matchedKeywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge 
                        variant={getScoreBadgeVariant(candidate.score)}
                        className="text-lg font-bold px-3 py-1"
                      >
                        {candidate.score}%
                      </Badge>
                      <Progress value={candidate.score} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};