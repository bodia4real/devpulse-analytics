import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, GitPullRequest, Languages } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Repository Analytics",
    description:
      "Track all your repos with stars, forks, issues, and watchers. Sort, filter, and search across your entire portfolio.",
  },
  {
    icon: GitPullRequest,
    title: "Contribution Tracking",
    description:
      "Visualize daily commits, pull requests, issues, and code reviews. See trends over 7, 30, or 90 day windows.",
  },
  {
    icon: Languages,
    title: "Language Insights",
    description:
      "See your top programming languages and their distribution across repositories with clear visual breakdowns.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Everything you need to understand your code
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Connect your GitHub account and get instant insights into your
          development activity.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 transition-colors hover:bg-card"
            >
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
