import { format, isPast, parseISO } from "date-fns";

const STATUS_CONFIG = {
  PENDING:     { label: "Pending",     cls: "bg-yellow-500/10 text-yellow-400" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-500/10 text-blue-400"    },
  COMPLETED:   { label: "Completed",   cls: "bg-green-500/10 text-green-400"  },
};

export default function TaskCard({ task, onClick }) {
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
  const isOverdue = task.dueDate && task.status !== "COMPLETED" && isPast(parseISO(task.dueDate));

  return (
    <div
      className="card hover:border-gray-700 cursor-pointer transition-colors group"
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-gray-100 group-hover:text-white text-sm leading-snug">
          {task.title}
        </h4>
        <span className={`badge shrink-0 ${cfg.cls}`}>{cfg.label}</span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-[10px]">
                {task.assignee.name[0].toUpperCase()}
              </div>
              <span>{task.assignee.name}</span>
            </>
          ) : (
            <span className="text-gray-600">Unassigned</span>
          )}
        </div>

        {task.dueDate && (
          <span className={isOverdue ? "text-red-400 font-medium" : ""}>
            {isOverdue ? "⚠ " : ""}
            {format(parseISO(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
