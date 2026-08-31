import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Building2,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import InsightCard from "@/components/InsightCard";

// Describes an individual insight displayed within a category.
interface InsightItem {
  title: string;
  description: string;
  value?: string;
  impact?: string;
}

// Defines the supported insight categories returned by the backend.
interface InsightCategory {
  type: "peak_hours" | "buildings" | "trends" | "recommendations";
  title: string;
  items: InsightItem[];
}

// Expected structure of the generated insights.
interface InsightsData {
  summary: string;
  categories: InsightCategory[];
}

const Insights = () => {
  // Provides programmatic navigation between application pages.
  const navigate = useNavigate();

  // Stores successfully generated insight data.
  const [insights, setInsights] = useState<InsightsData | null>(null);

  // Tracks whether an insights request is currently running.
  const [isLoading, setIsLoading] = useState(false);

  // Stores a user-facing error message when generation fails.
  const [error, setError] = useState<string>("");

  // Distinguishes the initial screen from the generated-results screen.
  const [hasGenerated, setHasGenerated] = useState(false);

  // Request AI-generated insights from the backend.
  const generateInsights = async () => {
    setIsLoading(true);

    // Clear any error left over from a previous attempt.
    setError("");

    try {
      const response = await fetch("http://localhost:8000/get-insights");

      // Extract the backend error message when one is available.
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.detail || "Failed to generate insights");
      }

      const data = await response.json();

      // Store the generated content and display the results view.
      setInsights(data.insights);
      setHasGenerated(true);
    } catch (err: unknown) {
      // Safely extract a message from standard Error objects.
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate insights. Please ensure the backend is running and try again.";

      setError(message);
      console.error("Error generating insights:", err);
    } finally {
      // End the loading state regardless of success or failure.
      setIsLoading(false);
    }
  };

  // Select the icon associated with each insight category.
  const getCategoryIcon = (type: InsightCategory["type"]) => {
    switch (type) {
      case "peak_hours":
        return Clock;
      case "buildings":
        return Building2;
      case "trends":
        return TrendingUp;
      case "recommendations":
        return Lightbulb;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Page heading and dashboard navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          {/* Decorative AI icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>

          <h1 className="font-display text-3xl font-black tracking-wider cyber-text">
            AI INSIGHTS
          </h1>
        </div>

        <p className="text-muted-foreground text-sm">
          AI-powered analysis of your campus carbon emissions
        </p>
      </div>

      {/* Main insights content */}
      <div className="max-w-6xl mx-auto">
        {/* Initial state shown before the first request */}
        {!hasGenerated && !isLoading && !error && (
          <div className="glass-panel p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />

            <h2 className="text-xl font-bold mb-2">Generate AI Insights</h2>

            <p className="text-muted-foreground mb-6">
              Get comprehensive analysis and recommendations for reducing your
              campus carbon footprint
            </p>

            <button
              onClick={generateInsights}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Generate Insights
            </button>
          </div>
        )}

        {/* Loading state displayed while the backend processes the request */}
        {isLoading && (
          <div className="glass-panel p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />

            <h2 className="text-xl font-bold mb-2">Generating Insights...</h2>

            <p className="text-muted-foreground">
              Analyzing your emissions data with AI. This may take a moment.
            </p>
          </div>
        )}

        {/* Error state with an option to retry the request */}
        {error && !isLoading && (
          <div className="glass-panel p-6 border-l-4 border-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />

              <div>
                <h3 className="font-bold text-destructive mb-1">Error</h3>

                <p className="text-sm text-muted-foreground">{error}</p>

                <button
                  onClick={generateInsights}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results displayed after insights are generated successfully */}
        {hasGenerated && insights && !isLoading && !error && (
          <div className="space-y-6 animate-fade-in">
            {/* High-level summary */}
            <div className="glass-panel p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>

                <div>
                  <h2 className="font-display text-xl font-bold mb-2">
                    Summary
                  </h2>

                  <p className="text-muted-foreground leading-relaxed">
                    {insights.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Category cards arranged in a responsive grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.categories.map((category, index) => (
                <InsightCard
                  // Prefer a stable category value over an array index.
                  key={`${category.type}-${category.title}`}
                  icon={getCategoryIcon(category.type)}
                  title={category.title}
                  items={category.items}
                  type={category.type}
                />
              ))}
            </div>

            {/* Actions for refreshing results or returning home */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={generateInsights}
                className="px-6 py-3 glass-panel hover:bg-muted/50 transition-colors rounded-lg text-sm font-medium"
              >
                Regenerate Insights
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
