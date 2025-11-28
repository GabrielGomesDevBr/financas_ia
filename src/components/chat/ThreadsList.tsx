'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Thread {
  id: string
  title: string
  last_message_at: string
  created_at: string
}

interface ThreadsListProps {
  threads: Thread[]
  currentThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewThread: () => void
  onDeleteThread: (threadId: string) => void
}

export function ThreadsList({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread
}: ThreadsListProps) {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Button
          onClick={onNewThread}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma conversa ainda.
            <br />
            Clique em &quot;Nova Conversa&quot; para começar!
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors group ${
                  currentThreadId === thread.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectThread(thread.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <h3 className="text-sm font-medium truncate">
                        {thread.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.last_message_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteThread(thread.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
