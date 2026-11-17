import { useState } from 'react';
import { activeMembers, byDoneAt, byDue, isLate, plural } from '../lib/rules';
import type { Task } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { useTitle } from '../components/ui';
import { QuickAdd, TaskDialog, TaskRow } from '../components/tasks';

/** "What is late, and whose is it?": one list for the whole board, filtered by person. */
export function Tasks() {
  useTitle('Tasks');
  const { data, me } = useStore();
  const [who, setWho] = useState('all');
  const [allDone, setAllDone] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const inView = data.tasks.filter((t) => who === 'all' || (who === 'none' ? !t.owner_id : t.owner_id === who));
  const open = inView.filter((t) => !t.done).sort(byDue);
  const done = inView.filter((t) => t.done).sort(byDoneAt);
  const late = open.filter((t) => isLate(t)).length;
  const person = who !== 'all' && who !== 'none';

  return (
    <Shell section="tasks">
      <TitleRow
        title="Tasks"
        sub={<>{plural(open.length, 'open task')}{late ? <>, <span className="late">{late} late</span></> : ''}{who === 'all' ? ' across the board.' : '.'}</>}
        actions={
          <div className="inline-select">
            <label htmlFor="show-who">Show</label>
            <select id="show-who" className="input" value={who} onChange={(e) => { setWho(e.target.value); setAllDone(false); }}>
              <option value="all">Everyone</option>
              {activeMembers(data.members).map((m) => (
                <option key={m.id} value={m.id}>{m.id === me.id ? 'My tasks' : m.full_name}</option>
              ))}
              <option value="none">Nobody yet</option>
            </select>
          </div>
        }
      />

      <section className="panel" aria-labelledby="todo-h">
        <header>
          <h2 id="todo-h">To do</h2>
          <span className="meta num">{open.length}</span>
        </header>
        <QuickAdd key={who} owner={person ? who : me.id} chooseOwner />
        {open.length > 0 ? (
          <ul className="tasks">
            {open.map((t) => <TaskRow key={t.id} task={t} showOwner={!person} onOpen={() => setEditing(t)} />)}
          </ul>
        ) : (
          <p className="empty">Nothing to do here.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="done-h">
        <header>
          <h2 id="done-h">Done</h2>
          <span className="meta num">{done.length}</span>
        </header>
        {done.length > 0 ? (
          <ul className="tasks">
            {(allDone ? done : done.slice(0, 5)).map((t) => <TaskRow key={t.id} task={t} showOwner={!person} onOpen={() => setEditing(t)} />)}
          </ul>
        ) : (
          <p className="empty">Nothing done yet.</p>
        )}
        {done.length > 5 && (
          <button type="button" className="more" onClick={() => setAllDone((v) => !v)}>
            {allDone ? 'Show fewer' : `Show all ${done.length}`}
          </button>
        )}
      </section>

      <TaskDialog key={editing?.id ?? 'none'} task={editing} onClose={() => setEditing(null)} />
    </Shell>
  );
}
