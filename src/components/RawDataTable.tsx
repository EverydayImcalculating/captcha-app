"use client";

import { useCaptchaStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { downloadCSV } from "@/utils/csvHandler";

export function RawDataTable() {
  const { results } = useCaptchaStore();

  return (
    <Card className="w-full border-4 border-white/50 shadow-cute bg-white/80 backdrop-blur-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-primary">
          Raw Test Data
        </CardTitle>
        <Button
          onClick={() => downloadCSV(results)}
          className="bg-secondary hover:bg-secondary/90 text-foreground rounded-full border-2 border-white/50"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary/20">
                <th className="text-left p-2 font-bold text-foreground">
                  Round
                </th>
                <th className="text-left p-2 font-bold text-foreground">
                  Type
                </th>
                <th className="text-right p-2 font-bold text-foreground">
                  Time (s)
                </th>
                <th className="text-center p-2 font-bold text-foreground">
                  Result
                </th>
                <th className="text-center p-2 font-bold text-foreground">
                  Frustration
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr
                  key={idx}
                  className="border-b border-muted/30 hover:bg-secondary/10 transition-colors"
                >
                  <td className="p-2 text-muted-foreground">{result.round}</td>
                  <td className="p-2">
                    <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {result.type}
                    </span>
                  </td>
                  <td className="p-2 text-right text-muted-foreground tabular-nums">
                    {(result.timeTaken / 1000).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    {result.accuracy ? (
                      <span className="inline-block px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-medium">
                        ✓ Pass
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                        ✗ Fail
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center text-muted-foreground tabular-nums">
                    {result.frustrationScore || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
