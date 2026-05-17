import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Streamdown } from "streamdown";

interface Solution {
  approach: string;
  code?: string;
  explanation: string;
  complexity?: {
    time: string;
    space: string;
  };
  tradeoffs?: string[];
  alternatives?: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description?: string;
  }>;
}

interface SolutionVerification {
  isValid: boolean;
  passedTests: number;
  totalTests: number;
  issues?: string[];
  suggestions?: string[];
}

interface SolutionDisplayProps {
  solution: Solution;
  verification: SolutionVerification;
  personalityNote: string;
  followUpQuestions?: string[];
  learningPoints?: string[];
}

export function SolutionDisplay({
  solution,
  verification,
  personalityNote,
  followUpQuestions,
  learningPoints,
}: SolutionDisplayProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = () => {
    if (solution.code) {
      navigator.clipboard.writeText(solution.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Personality Note */}
      {personalityNote && (
        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-transparent">
          <CardContent className="pt-6">
            <p className="text-sm italic text-gray-700">{personalityNote}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Solution Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Solusi</CardTitle>
            <Badge variant={verification.isValid ? "default" : "destructive"}>
              {verification.isValid ? "✓ Valid" : "✗ Issues"}
            </Badge>
          </div>
          <CardDescription>{solution.approach}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="explanation" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="explanation">Penjelasan</TabsTrigger>
              {solution.code && <TabsTrigger value="code">Kode</TabsTrigger>}
              {solution.complexity && <TabsTrigger value="complexity">Kompleksitas</TabsTrigger>}
              {solution.alternatives && solution.alternatives.length > 0 && (
                <TabsTrigger value="alternatives">Alternatif</TabsTrigger>
              )}
            </TabsList>

            {/* Explanation Tab */}
            <TabsContent value="explanation" className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <Streamdown>{solution.explanation}</Streamdown>
              </div>

              {/* Verification Status */}
              <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
                <h4 className="font-semibold text-sm">Verifikasi</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Tests Passed</p>
                    <p className="text-lg font-bold">
                      {verification.passedTests}/{verification.totalTests}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className={`text-lg font-bold ${verification.isValid ? "text-green-600" : "text-red-600"}`}>
                      {verification.isValid ? "Valid" : "Issues"}
                    </p>
                  </div>
                </div>

                {/* Issues */}
                {verification.issues && verification.issues.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold text-red-600">Issues:</p>
                    <ul className="space-y-1">
                      {verification.issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-red-600">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {verification.suggestions && verification.suggestions.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold text-blue-600">Saran:</p>
                    <ul className="space-y-1">
                      {verification.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-xs text-blue-600">
                          • {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Code Tab */}
            {solution.code && (
              <TabsContent value="code" className="space-y-4">
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-2 z-10"
                    onClick={copyToClipboard}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                    <code>{solution.code}</code>
                  </pre>
                </div>

                {/* Test Cases */}
                {solution.testCases && solution.testCases.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Test Cases</h4>
                    {solution.testCases.map((testCase, idx) => (
                      <div key={idx} className="space-y-1 rounded-lg border p-3">
                        <p className="text-xs font-semibold text-gray-600">Test {idx + 1}</p>
                        {testCase.description && (
                          <p className="text-xs text-gray-600">{testCase.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="font-semibold text-gray-700">Input:</p>
                            <p className="font-mono text-gray-600">{testCase.input}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">Expected:</p>
                            <p className="font-mono text-gray-600">{testCase.expectedOutput}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {/* Complexity Tab */}
            {solution.complexity && (
              <TabsContent value="complexity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Time Complexity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono text-lg font-bold text-blue-600">{solution.complexity.time}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Space Complexity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono text-lg font-bold text-green-600">{solution.complexity.space}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Trade-offs */}
                {solution.tradeoffs && solution.tradeoffs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Trade-offs</h4>
                    <ul className="space-y-1">
                      {solution.tradeoffs.map((tradeoff, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {tradeoff}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
            )}

            {/* Alternatives Tab */}
            {solution.alternatives && solution.alternatives.length > 0 && (
              <TabsContent value="alternatives" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Alternatif Pendekatan</h4>
                  <ul className="space-y-2">
                    {solution.alternatives.map((alt, idx) => (
                      <li key={idx} className="flex items-start space-x-2 rounded-lg border p-3">
                        <Badge variant="outline" className="mt-0.5">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm text-gray-700">{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Learning Points */}
      {learningPoints && learningPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Poin Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {learningPoints.map((point, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-sm">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-400 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions && followUpQuestions.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-base">Pertanyaan Lanjutan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUpQuestions.map((question, idx) => (
                <Button key={idx} variant="outline" className="w-full justify-start text-left h-auto py-2 px-3">
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
