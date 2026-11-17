import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { addDays, longDate, shortDate, today } from '../lib/dates';
import { download, toCsv } from '../lib/files';
import { go, href } from '../lib/router';
import { activeMembers, comingMeetings, firstName, meetingTally, memberTally, pastMeetings, plural, PRESENCE_LABEL } from '../lib/rules';
import type { Meeting } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { Dialog, Field, Pill, useTitle } from '../components/ui';

/** "Who came, and is each PV in?" */
export function Meetings() {
  useTitle('Meetings');
  const store = useStore();
  const { data } = store;
  const [adding, setAdding] = useState(false);

  const coming = comingMeetings(data.meetings);
  const past = pastMeetings(data.meetings);
  const missing = past.filter((m) => !m.pv_path).length;
  const next = coming[0];

  function exportAttendance() {
    const held = [...past].reverse();
    const head = ['Member', 'Role', ...held.map((m) => m.date), 'Present', 'Excused', 'Absent'];
    const rows = activeMembers(data.members).map((p) => {
      const t = memberTally(data, p.id);
      return [
        p.full_name, p.role,
        ...held.map((m) => {
          const a = data.attendance.find((x) => x.meeting_id === m.id && x.member_id === p.id);
          return a ? PRESENCE_LABEL[a.status] : '';
        }),
        t.present, t.excused, t.absent,
      ];
    });
    download(`board-attendance-${today()}.csv`, toCsv([head, ...rows]), 'text/csv;charset=utf-8');
  }

  return (
    <Shell section="meetings">
      <TitleRow
        title="Meetings"
        sub={<>
          {next ? <>Next: {longDate(next.date)}{next.time ? ` at ${next.time}` : ''}{next.place ? `, ${next.place}` : ''}.</> : 'No meeting planned yet.'}
          {missing > 0 && <span className="late"> {plural(missing, 'PV')} missing.</span>}
        </>}
        actions={<>
          {data.meetings.length > 0 && <button type="button" className="btn" onClick={exportAttendance}><Download /> Export attendance</button>}
          <button type="button" className="btn primary" onClick={() => setAdding(true)}><Plus /> Add meeting</button>
        </>}
      />

      <section className="panel flush" aria-labelledby="meetings-h">
        <header><h2 id="meetings-h">All meetings</h2></header>
        {data.meetings.length > 0 ? (
          <table className="stack-sm">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Who was missing</th>
                <th scope="col" className="n">Present</th>
                <th scope="col" className="n">PV</th>
              </tr>
            </thead>
            <tbody>
              {[...coming, ...past].map((m) => {
                const t = meetingTally(data, m.id);
                const isPast = m.date < today();
                const dash = <span className="faint">–</span>;
                const missed = data.attendance
                  .filter((a) => a.meeting_id === m.id && a.status !== 'present')
                  .sort((a, b) => a.status.localeCompare(b.status))
                  .map((a) => `${firstName(store.member(a.member_id)?.full_name ?? 'Someone')} (${a.status})`)
                  .join(', ');
                const missing = t.marked === 0 ? (isPast ? 'Attendance not taken' : 'Not held yet') : missed || 'Nobody, everyone came';
                return (
                  <tr key={m.id} className="clickable" onClick={() => go(`/meetings/${m.id}`)}>
                    <td className="lead">
                      <a className="title" href={href(`/meetings/${m.id}`)} onClick={(e) => e.stopPropagation()}>
                        {shortDate(m.date)}{m.date === today() ? ' (today)' : ''}
                      </a>
                      <span className="sub">{[m.time, m.place].filter(Boolean).join(' · ') || ' '}</span>
                    </td>
                    <td className={`hide-sm${missed ? '' : ' muted'}`}>{missing}</td>
                    <td className="n num hide-sm nowrap">{t.marked ? `${t.present} of ${t.marked}` : dash}</td>
                    <td className="line2 show-sm">{t.marked ? `${t.present} of ${t.marked} present${missed ? `. Missing: ${missed}` : ''}` : missing}</td>
                    <td className="n end">
                      {m.pv_path ? (
                        <button type="button" className="text-link" onClick={(e) => { e.stopPropagation(); store.openPv(m); }}>Open</button>
                      ) : isPast ? <Pill tone="warn">Missing</Pill> : dash}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty inset">
            <p>No meetings yet.</p>
            <button type="button" className="btn small" onClick={() => setAdding(true)}>Add the first meeting</button>
          </div>
        )}
      </section>

      <MeetingDialog key={adding ? 'new' : 'none'} open={adding} onClose={() => setAdding(false)} />
    </Shell>
  );
}

/** Add a meeting (pre-filled a week after the last one, same time and place) or change one. */
export function MeetingDialog({ meeting, open, onClose }: { meeting?: Meeting; open: boolean; onClose(): void }) {
  const { data, saveMeeting, deleteMeeting } = useStore();
  const last = [...data.meetings].sort((a, b) => b.date.localeCompare(a.date))[0];
  const [date, setDate] = useState(meeting?.date ?? (last ? addDays(last.date, 7) : today()));
  const [time, setTime] = useState(meeting?.time ?? last?.time ?? '');
  const [place, setPlace] = useState(meeting?.place ?? last?.place ?? '');

  return (
    <Dialog
      open={open}
      title={meeting ? 'Meeting' : 'New meeting'}
      submitLabel={meeting ? 'Save' : 'Add meeting'}
      onClose={onClose}
      onSubmit={async () => {
        const row = await saveMeeting({ ...(meeting ? { id: meeting.id } : {}), date, time: time.trim() || null, place: place.trim() || null });
        if (row && !meeting) go(`/meetings/${row.id}`);
        return !!row;
      }}
      footer={meeting && (
        <button type="button" className="btn danger" onClick={async () => {
          if (confirm(`Delete the meeting of ${longDate(meeting.date)}, with its attendance and PV?`) && (await deleteMeeting(meeting))) {
            onClose();
            go('/meetings');
          }
        }}>Delete</button>
      )}
    >
      <div className="fields two">
        <Field label="Date" wide>
          {(id) => <input id={id} className="input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />}
        </Field>
        <Field label="Time">
          {(id) => <input id={id} className="input" placeholder="18:00" value={time} onChange={(e) => setTime(e.target.value)} />}
        </Field>
        <Field label="Place">
          {(id) => <input id={id} className="input" value={place} onChange={(e) => setPlace(e.target.value)} />}
        </Field>
      </div>
    </Dialog>
  );
}
