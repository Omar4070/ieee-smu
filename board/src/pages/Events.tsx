import { useState } from 'react';
import { Plus } from 'lucide-react';
import { relative, shortDate } from '../lib/dates';
import { activeMembers, ANNOUNCE_BEFORE, comingEvents, needsAnnouncing, pastEvents, plural, STATUS_LABEL } from '../lib/rules';
import type { BoardEvent, EventStatus } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { Dialog, Field, Person, Pill, Segmented, useTitle } from '../components/ui';

/** "What is coming, who runs it, and is it announced?" */
export function Events() {
  useTitle('Events');
  const { data } = useStore();
  const [editing, setEditing] = useState<BoardEvent | 'new' | null>(null);
  const [allPast, setAllPast] = useState(false);

  const coming = comingEvents(data.events);
  const past = pastEvents(data.events);
  const alerts = coming.filter((e) => needsAnnouncing(e));

  const sub = coming.length === 0 ? 'Nothing planned yet.' : (
    <>
      {plural(coming.length, 'event')} coming up.{' '}
      {alerts.length === 1 && <span className="late">Announce “{alerts[0].title}”: it is {relative(alerts[0].date)}.</span>}
      {alerts.length > 1 && <span className="late">{alerts.length} events are less than {ANNOUNCE_BEFORE} days away and not announced.</span>}
    </>
  );

  return (
    <Shell section="events">
      <TitleRow
        title="Events"
        sub={sub}
        actions={<button type="button" className="btn primary" onClick={() => setEditing('new')}><Plus /> Add event</button>}
      />

      <section className="panel flush" aria-labelledby="coming-h">
        <header><h2 id="coming-h">Coming up</h2></header>
        {coming.length > 0
          ? <EventTable events={coming} onOpen={setEditing} />
          : (
            <div className="empty inset">
              <p>No events coming up.</p>
              <button type="button" className="btn small" onClick={() => setEditing('new')}>Add the next event</button>
            </div>
          )}
      </section>

      <section className="panel flush" aria-labelledby="past-h">
        <header><h2 id="past-h">Past</h2></header>
        {past.length > 0
          ? <EventTable events={allPast ? past : past.slice(0, 5)} onOpen={setEditing} past />
          : <p className="empty inset">No past events yet.</p>}
        {past.length > 5 && (
          <button type="button" className="more inset" onClick={() => setAllPast((v) => !v)}>
            {allPast ? 'Show fewer' : `Show all ${past.length}`}
          </button>
        )}
      </section>

      <EventDialog key={editing === 'new' ? 'new' : editing?.id ?? 'none'} event={editing} onClose={() => setEditing(null)} />
    </Shell>
  );
}

function EventTable({ events, onOpen, past }: { events: BoardEvent[]; onOpen(e: BoardEvent): void; past?: boolean }) {
  const { member } = useStore();
  return (
    <table className="stack-sm">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Event</th>
          <th scope="col">Ambassador</th>
          <th scope="col" className="n">{past ? 'Outcome' : 'Status'}</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id} className="clickable" onClick={() => onOpen(e)}>
            <td className="date num nowrap">{shortDate(e.date)}</td>
            <td className="lead">
              <button type="button" className="title row-button" onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}>{e.title}</button>
              <span className="sub">{[e.time, e.place].filter(Boolean).join(' · ') || ' '}</span>
            </td>
            <td className="line2"><Person member={member(e.ambassador_id)} fallback="No ambassador yet" /></td>
            <td className="n end">
              {past
                ? <span className="muted">{e.status === 'cancelled' ? 'Cancelled' : 'Held'}</span>
                : needsAnnouncing(e)
                  ? <Pill tone="neg">Not announced</Pill>
                  : <Pill tone={e.status === 'announced' ? 'pos' : undefined}>{STATUS_LABEL[e.status]}</Pill>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EventDialog({ event, onClose }: { event: BoardEvent | 'new' | null; onClose(): void }) {
  const { saveEvent, deleteEvent, data } = useStore();
  const e = event && event !== 'new' ? event : null;
  const [title, setTitle] = useState(e?.title ?? '');
  const [date, setDate] = useState(e?.date ?? '');
  const [time, setTime] = useState(e?.time ?? '');
  const [place, setPlace] = useState(e?.place ?? '');
  const [ambassador, setAmbassador] = useState(e?.ambassador_id ?? '');
  const [status, setStatus] = useState<EventStatus>(e?.status ?? 'planning');
  const [notes, setNotes] = useState(e?.notes ?? '');

  return (
    <Dialog
      open={!!event}
      title={e ? 'Event' : 'New event'}
      submitLabel={e ? 'Save' : 'Add event'}
      onClose={onClose}
      onSubmit={async () => !!(await saveEvent({
        ...(e ? { id: e.id } : {}),
        title: title.trim(), date, time: time.trim() || null, place: place.trim() || null,
        ambassador_id: ambassador || null, status, notes: notes.trim() || null,
      }))}
      footer={e && (
        <button type="button" className="btn danger" onClick={async () => {
          if (confirm(`Delete “${e.title}”?`) && (await deleteEvent(e))) onClose();
        }}>Delete</button>
      )}
    >
      <div className="fields">
        <Field label="Event name">
          {(id) => <input id={id} className="input" required value={title} onChange={(x) => setTitle(x.target.value)} />}
        </Field>
        <div className="fields two">
          <Field label="Date">
            {(id) => <input id={id} className="input" type="date" required value={date} onChange={(x) => setDate(x.target.value)} />}
          </Field>
          <Field label="Time">
            {(id) => <input id={id} className="input" placeholder="14:00–17:00" value={time} onChange={(x) => setTime(x.target.value)} />}
          </Field>
          <Field label="Place">
            {(id) => <input id={id} className="input" value={place} onChange={(x) => setPlace(x.target.value)} />}
          </Field>
          <Field label="Ambassador">
            {(id) => (
              <select id={id} className="input" value={ambassador} onChange={(x) => setAmbassador(x.target.value)}>
                <option value="">Nobody yet</option>
                {activeMembers(data.members).map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            )}
          </Field>
        </div>
        <div className="field">
          <span className="label">Status</span>
          <Segmented<EventStatus>
            label="Status" value={status} onChange={setStatus}
            options={(['planning', 'announced', 'cancelled'] as EventStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <span className="hint">Announce it at least {ANNOUNCE_BEFORE} days before the date.</span>
        </div>
        <Field label="Notes">
          {(id) => <textarea id={id} className="input" rows={3} value={notes} onChange={(x) => setNotes(x.target.value)} />}
        </Field>
      </div>
    </Dialog>
  );
}
