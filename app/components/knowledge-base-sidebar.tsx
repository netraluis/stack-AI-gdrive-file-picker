"use client"
import { Trash2, File } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface KnowledgeBaseSidebarProps {
  knowledgeBaseHistory: string[]
  switchToKnowledgeBase: (id: string) => void
  removeFromHistory: (id: string) => void
}

export function KnowledgeBaseSidebar({
  knowledgeBaseHistory,
  switchToKnowledgeBase,
  removeFromHistory,
}: KnowledgeBaseSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Knowledge Base History</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {knowledgeBaseHistory.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No history available</div>
          ) : (
            <div className="space-y-1">
              {knowledgeBaseHistory.map((id) => (
                <div key={id} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => switchToKnowledgeBase(id)}
                    className="text-sm justify-start h-auto py-1 px-2 w-[80%]"
                  >
                    <File className="h-4 w-4 mr-2" />
                    <span className="truncate" title={id}>
                      {id.substring(0, 8)}...
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromHistory(id)}
                    className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-background"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
