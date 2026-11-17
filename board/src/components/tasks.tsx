import { useId, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { dayMonth, dueLabel, toDay } from '../lib/dates';
import { activeMembers, isLate } from '../lib/rules';
import type { Task } from '../lib/types';
import { useStore } from '../store';
import { Dialog, Field, Person } from './ui';

/** One task: tick it off, or open it to change it. */
export function TaskRow({ task, showOwner, onOpen }: { task: Task; showOwner?: boolean; onOpen(): void }) {
  const { toggleTask, member } = useStore();
  const late = isLate(task);
  return (
    <li className={`task${task.done ? ' is-done' : ''}`}>
      <input
        type="checkbox" className="tick" checked={task.done} onChange={() => toggleTask(task)}
        aria-label={`${task.done ? 'Not done' : 'Done'}: ${task.title}`}
      />
      <button type="button" className="task-title" onClick={onOpen}>{task.title}</button>
      {showOwner && <span className="task-owner"><Person member={member(task.owner_id)} short fallback="Nobody yet" /></span>}
      <span className={`task-due num${late ? ' late' : ''}`}>
        {task.done
          ? `Done ${task.done_at ? dayMonth(toDay(new Date(task.done_at))) : ''}`
          : task.due_date ? dueLabel(task.due_date) : <span className="faint">No date</span>}
      </span>
    </li>
  );
}

/** The one-line form under a task list: name, who, when, Add. */
export function QuickAdd({ owner, chooseOwner }: { owner: string; chooseOwner?: boolean }) {
  const { saveTask, data, me } = useStore();
  const [title, setTitle] = useState('');
  const [who, setWho] = useState(owner);
  const [due, setDue] = useState('');
  const id = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const row = await saveTask({ title: title.trim(), owner_id: chooseOwner ? who || null : owner, due_date: due || null });
    if (row) { setTitle(''); setDue(''); }
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <label className="sr-only" htmlFor={`${id}-t`}>New task</label>
      <input
        id={`${id}-t`} className="input qa-title" placeholder={chooseOwner ? 'Add a task…' : 'Add a task for yourself…'}
        value={title} onChange={(e) => setTitle(e.target.value)} autoComplete="off"
      />
      {chooseOwner && (
        <>
          <label className="sr-only" htmlFor={`${id}-w`}>For</label>
          <select id={`${id}-w`} className="input qa-who" value={who} onChange={(e) => setWho(e.target.value)}>
            {activeMembers(data.members).map((m) => (
              <option key={m.id} value={m.id}>{m.id === me.id ? `Me (${m.full_name.split(' ')[0]})` : m.full_name}</option>
            ))}
            <option value="">Nobody yet</option>
          </select>
        </>
      )}
      <label className="sr-only" htmlFor={`${id}-d`}>Due</label>
      <input id={`${id}-d`} className="input qa-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <button type="submit" className="btn primary qa-add" disabled={!title.trim()}>
        <Plus /> Add
      </button>
    </form>
  );
}

export function TaskDialog({ task, onClose }: { task: Task | null; onClose(): void }) {
  const { saveTask, deleteTask, data } = useStore();
  const [title, setTitle] = useState(task?.title ?? '');
  const [owner, setOwner] = useState(task?.owner_id ?? '');
  const [due, setDue] = useState(task?.due_date ?? '');

  return (
    <Dialog
      open={!!task}
      title="Task"
      onClose={onClose}
      onSubmit={async () => !!(await saveTask({ id: task!.id, title: title.trim(), owner_id: owner || null, due_date: due || null }))}
      footer={
        <button type="button" className="btn danger" onClick={async () => {
          if (task && confirm(`Delete “${task.title}”?`) && (await deleteTask(task))) onClose();
        }}>Delete</button>
      }
    >
      <div className="fields">
        <Field label="What needs doing">
          {(id) => <input id={id} className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />}
        </Field>
        <div className="fields two">
          <Field label="Who">
            {(id) => (
              <select id={id} className="input" value={owner} onChange={(e) => setOwner(e.target.value)}>
                <option value="">Nobody yet</option>
                {activeMembers(data.members).map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            )}
          </Field>
          <Field label="Due">
            {(id) => <input id={id} className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />}
          </Field>
        </div>
      </div>
    </Dialog>
  );
}
