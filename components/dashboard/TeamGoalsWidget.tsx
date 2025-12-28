import { 
  Target, 
  AlertCircle 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getGoalsDashboardData } from "@/app/actions/governance"
import { GoalItem } from "./goal-item"

export async function TeamGoalsWidget() {
  const goals = await getGoalsDashboardData()

  return (
    <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl border-2">
      <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Operation Limits</CardTitle>
            </div>
            <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background/50 border-primary/20">
                Democratic Governance
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {goals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
        ))}
        {goals.length === 0 && (
            <div className="flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
                <AlertCircle className="h-4 w-4 opacity-50" />
                No goals defined in database.
            </div>
        )}
      </CardContent>
    </Card>
  )
}