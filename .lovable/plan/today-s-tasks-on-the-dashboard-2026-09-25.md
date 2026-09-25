# Today’s tasks on the dashboard

## What will change
- Save Task Planner tasks in the browser so they remain available when moving between pages.
- Add a compact **Today’s focus** section to the dashboard showing the most relevant tasks at a glance.
- Prioritise overdue and due-today items, then high-priority tasks; show short deadline, priority, and time details.
- Add a clear **View in Task Planner** link for the complete task list and schedule tools.
- Show a helpful empty state linking to Task Planner when no tasks have been added.

## Technical details
- Extend the existing browser-storage utilities with a shared task list and reactive hook.
- Update Task Planner to use the shared stored list instead of temporary page-only state.
- Keep the current visual style, all planner behaviour, and mobile responsiveness unchanged.
- Verify adding/removing tasks, dashboard updates, navigation, and desktop/mobile layouts.
