import { useRef, useState } from 'react';
import { ChevronLeft, FileText, Upload } from 'lucide-react';
import { longDate } from '../lib/dates';
import { href } from '../lib/router';
import { activeMembers, byBoardOrder, meetingTally, PRESENCE_LABEL } from '../lib/rules';
import type { Meeting, Presence } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { Person, Segmented, useTitle } from '../components/ui';
import { MeetingDialog } from './Meetings';

const PRESENCE: Presence[] = ['present', 'excused', 'absent'];

/** One meeting: take attendance with one tap per person, then upload the PV. */
export function MeetingDetail({ id }: { id: string }) {
  const { data, mark } = useStore();
  const [editing, setEditing] = useState(false);
  const m = data.meetings.find((x) => x.id === id);
  useTitle(m ? `Meeting, ${longDate(m.date)}` : 'Meeting not found');

  const back = <a className="back" href={href('/meetings')}><ChevronLeft /> Meetings</a>;
  if (!m) {
    return (
      <Shell section="meetings">
        <TitleRow back={back} title="Meeting not found" sub="It may have been deleted. Go back to the list of meetings." />
      </Shell>
    );
  }

  const marks = new Map(data.attendance.filter((a) => a.meeting_id === m.id).map((a) => [a.member_id, a.status]));
  // the current board, plus anyone who has left since but was marked at this meeting
  const people = [
    ...activeMembers(data.members),
    ...data.members.filter((p) => !p.active && marks.has(p.id)).sort(byBoardOrder),
  ];
  const unmarked = people.filter((p) => !marks.has(p.id));
  const t = meetingTally(data, m.id);

  return (
    <Shell section="meetings">
      <TitleRow
        back={back}
        title={longDate(m.date)}
        sub={<>
          Board meeting{m.time ? ` at ${m.time}` : ''}{m.place ? `, ${m.place}` : ''}.{' '}
          {t.marked > 0 && <>{t.present} present, {t.excused} excused, {t.absent} absent.</>}
        </>}
        actions={<button type="button" className="btn" onClick={() => setEditing(true)}>Edit meeting</button>}
      />

      <section className="panel" aria-labelledby="att-h">
        <header>
          <h2 id="att-h">Attendance</h2>
          {unmarked.length > 0 && (
            <button type="button" className="btn small" onClick={() => mark(m.id, unmarked.map((p) => p.id), 'present')}>
              Mark the other {unmarked.length} present
            </button>
          )}
        </header>
        <ul className="roll">
          {people.map((p) => (
            <li key={p.id}>
              <span className="who">
                <Person member={p} />
                <span className="role">{p.role}</span>
              </span>
              <Segmented
                label={`${p.full_name}: attendance`}
                className="presence"
                value={marks.get(p.id)}
                onChange={(s) => mark(m.id, [p.id], s)}
                options={PRESENCE.map((s) => ({ value: s, label: PRESENCE_LABEL[s], className: s }))}
              />
            </li>
          ))}
        </ul>
      </section>

      <Minutes meeting={m} />

      <MeetingDialog key={editing ? 'edit' : 'closed'} meeting={m} open={editing} onClose={() => setEditing(false)} />
    </Shell>
  );
}

const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';

function Minutes({ meeting }: { meeting: Meeting }) {
  const { uploadPv, openPv, removePv, toast } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  async function take(file: File | undefined) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast('That file is over 10 MB. Export a smaller PDF.', 'error');
    setBusy(true);
    await uploadPv(meeting, file);
    setBusy(false);
  }

  return (
    <section className="panel" aria-labelledby="pv-h">
      <header><h2 id="pv-h">Minutes (PV)</h2></header>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      {meeting.pv_path ? (
        <div className="file-row">
          <span className="file-icon"><FileText /></span>
          <span className="grow truncate">{meeting.pv_name ?? 'PV'}</span>
          <button type="button" className="btn small" onClick={() => openPv(meeting)}>Open</button>
          <button type="button" className="btn small" onClick={() => input.current?.click()} disabled={busy}>Replace</button>
          <button type="button" className="btn small ghost" onClick={() => { if (confirm('Remove this PV?')) removePv(meeting); }}>Remove</button>
        </div>
      ) : (
        <button
          type="button"
          className={`drop-zone${over ? ' over' : ''}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
          disabled={busy}
        >
          <Upload />
          <span><b>{busy ? 'Uploading…' : 'Upload the PV'}</b> or drop the file here</span>
          <span className="small muted">PDF, Word or a photo, up to 10 MB</span>
        </button>
      )}
    </section>
  );
}
