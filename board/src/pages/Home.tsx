import { useState } from 'react';
import { shortDate, toDay, today } from '../lib/dates';
import { href } from '../lib/router';
import { byDue, comingEvents, comingMeetings, isLate, needsAnnouncing, plural, STATUS_LABEL } from '../lib/rules';
import type { Task } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { Pill, useTitle } from '../components/ui';
import { QuickAdd, TaskDialog, TaskRow } from '../components/tasks';
import { InstallHint } from '../components/Install';

/** "What do I need to do this week?": your tasks first, then what is coming up. */
export function Home() {
  useTitle('This week');
  const { data, me, member } = useStore();
  const [editing, setEditing] = useState<Task | null>(null);
  const T = today();

  const mine = data.tasks.filter((t) => t.owner_id === me.id);
  const open = mine.filter((t) => !t.done).sort(byDue);
  // ticked off today: they stay on the list, struck through, until tomorrow
  const doneToday = mine.filter((t) => t.done && t.done_at && toDay(new Date(t.done_at)) === T);
  const myLate = open.filter((t) => isLate(t)).length;
  const othersLate = data.tasks.filter((t) => t.owner_id !== me.id && isLate(t)).length;

  const meeting = comingMeetings(data.meetings)[0];
  const events = comingEvents(data.events).filter((e) => e.status !== 'cancelled').slice(0, 4);

  const sub = (
    <>
      {open.length === 0 ? 'Nothing left on your list. ' : <>{plural(open.length, 'task')} on your list{myLate ? <>, <span className="late">{myLate} late</span></> : ''}. </>}
      {othersLate > 0 && <a className="text-link" href={href('/tasks')}>{plural(othersLate, 'task')} late across the board</a>}
    </>
  );

  return (
    <Shell section="home">
      <TitleRow title="This week" sub={sub} />
      <InstallHint />

      <section className="panel" aria-labelledby="mine-h">
        <header>
          <h2 id="mine-h">Your tasks</h2>
          <a className="card-link" href={href('/tasks')}>Everyone’s tasks</a>
        </header>
        <QuickAdd owner={me.id} />
        {open.length + doneToday.length > 0 ? (
          <ul className="tasks">
            {[...open, ...doneToday].map((t) => <TaskRow key={t.id} task={t} onOpen={() => setEditing(t)} />)}
          </ul>
        ) : (
          <p className="empty">Nothing on your list.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="next-h">
        <header>
          <h2 id="next-h">Coming up</h2>
          <a className="card-link" href={href('/events')}>All events</a>
        </header>
        <ul className="agenda">
          {meeting && (
            <li>
              <span className="when num">{shortDate(meeting.date)}</span>
              <a className="what" href={href(`/meetings/${meeting.id}`)}>
                <span className="title">Board meeting</span>
                <span className="sub">{[meeting.time, meeting.place].filter(Boolean).join(' · ') || 'Time to be set'}</span>
              </a>
              <span className="end" />
            </li>
          )}
          {events.map((e) => (
            <li key={e.id}>
              <span className="when num">{shortDate(e.date)}</span>
              <a className="what" href={href('/events')}>
                <span className="title">{e.title}</span>
                <span className="sub">{member(e.ambassador_id)?.full_name ?? 'No ambassador yet'}{e.time ? ` · ${e.time}` : ''}</span>
              </a>
              <span className="end">
                {needsAnnouncing(e) ? <Pill tone="neg">Not announced</Pill> : <Pill tone={e.status === 'announced' ? 'pos' : undefined}>{STATUS_LABEL[e.status]}</Pill>}
              </span>
            </li>
          ))}
          {!meeting && events.length === 0 && (
            <li className="empty">
              <p>Nothing planned yet.</p>
              <p><a className="text-link" href={href('/meetings')}>Add a meeting</a> or <a className="text-link" href={href('/events')}>an event</a></p>
            </li>
          )}
        </ul>
      </section>

      <TaskDialog key={editing?.id ?? 'none'} task={editing} onClose={() => setEditing(null)} />
    </Shell>
  );
}
