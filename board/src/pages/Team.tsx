import { useState } from 'react';
import { Copy, Plus } from 'lucide-react';
import { copyText } from '../lib/files';
import { activeMembers, byBoardOrder, firstName, isLate, memberTally, plural } from '../lib/rules';
import type { Member } from '../lib/types';
import { useStore } from '../store';
import { Shell, TitleRow } from '../components/Shell';
import { Avatar, Dialog, Field, Pill, useTitle } from '../components/ui';

/** "Who is on the board, and is anyone falling behind?" */
export function Team() {
  useTitle('Team');
  const { data, me } = useStore();
  const [editing, setEditing] = useState<Member | 'new' | null>(null);
  const board = activeMembers(data.members);
  const former = data.members.filter((m) => !m.active).sort(byBoardOrder);

  const marks = data.attendance.filter((a) => board.some((m) => m.id === a.member_id));
  const rate = marks.length ? Math.round((marks.filter((a) => a.status === 'present').length / marks.length) * 100) : null;
  const waiting = board.filter((m) => !m.auth_user_id).length;

  return (
    <Shell section="team">
      <TitleRow
        title="Team"
        sub={<>
          {plural(board.length, 'person', 'people')} on the board.
          {rate !== null && <> Attendance {rate}% so far.</>}
          {me.admin && waiting > 0 && <> {plural(waiting, 'person', 'people')} not signed in yet.</>}
        </>}
        actions={me.admin && <button type="button" className="btn primary" onClick={() => setEditing('new')}><Plus /> Add member</button>}
      />

      <section className="panel flush" aria-labelledby="board-h">
        <header>
          <h2 id="board-h">The board</h2>
          {!me.admin && <span className="meta">Ask an admin to add or change someone.</span>}
        </header>
        <MemberTable members={board} onOpen={me.admin ? setEditing : undefined} />
      </section>

      {former.length > 0 && (
        <section className="panel flush" aria-labelledby="former-h">
          <header><h2 id="former-h">Former members</h2></header>
          <MemberTable members={former} onOpen={me.admin ? setEditing : undefined} />
        </section>
      )}

      <MemberDialog key={editing === 'new' ? 'new' : editing?.id ?? 'none'} member={editing} onClose={() => setEditing(null)} />
    </Shell>
  );
}

function MemberTable({ members, onOpen }: { members: Member[]; onOpen?(m: Member): void }) {
  const { data, me } = useStore();
  return (
    <table className="stack-sm">
      <thead>
        <tr>
          <th scope="col">Member</th>
          <th scope="col" className="hide-md">Email</th>
          <th scope="col" className="n">Present</th>
          <th scope="col" className="n">Excused</th>
          <th scope="col" className="n">Absent</th>
          <th scope="col" className="n">Open tasks</th>
          {me.admin && <th scope="col" className="n">Login</th>}
        </tr>
      </thead>
      <tbody>
        {members.map((m) => {
          const t = memberTally(data, m.id);
          const open = data.tasks.filter((x) => x.owner_id === m.id && !x.done);
          const late = open.filter((x) => isLate(x)).length;
          return (
            <tr key={m.id} className={onOpen ? 'clickable' : undefined} onClick={onOpen && (() => onOpen(m))}>
              <td className="lead">
                <span className="person">
                  <Avatar member={m} />
                  <span>
                    {onOpen
                      ? <button type="button" className="title row-button" onClick={(e) => { e.stopPropagation(); onOpen(m); }}>{m.full_name}</button>
                      : <span className="title">{m.full_name}</span>}
                    <span className="sub">{m.role}{m.admin ? ' · admin' : ''}</span>
                  </span>
                </span>
              </td>
              <td className="hide-md">
                {m.email
                  ? <a className="email" href={`mailto:${m.email}`} onClick={(e) => e.stopPropagation()}>{m.email}</a>
                  : <span className="faint">–</span>}
              </td>
              <td className="n num hide-sm">{t.present}</td>
              <td className="n num hide-sm">{t.excused}</td>
              <td className="n num hide-sm">{t.absent}</td>
              <td className="n num hide-sm">{open.length}{late > 0 && <span className="late"> ({late} late)</span>}</td>
              <td className="line2 show-sm">
                {t.present} present · {t.excused} excused · {t.absent} absent · {plural(open.length, 'open task')}{late > 0 && <span className="late"> ({late} late)</span>}
              </td>
              {me.admin && (
                <td className="n end">
                  {m.auth_user_id ? <span className="muted">Signed in</span> : m.active ? <Pill tone="warn">Invite sent</Pill> : <span className="faint">–</span>}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Add or edit a person. Adding one gives an invite code at once, with a message to send them. */
function MemberDialog({ member, onClose }: { member: Member | 'new' | null; onClose(): void }) {
  const { data, me, saveMember, newInvite, resetLogin, toast } = useStore();
  const [saved, setSaved] = useState<Member | null>(member && member !== 'new' ? member : null);
  const m = saved;
  const [name, setName] = useState(m?.full_name ?? '');
  const [email, setEmail] = useState(m?.email ?? '');
  const [role, setRole] = useState(m?.role ?? '');
  const [admin, setAdmin] = useState(m?.admin ?? false);
  const [active, setActive] = useState(m?.active ?? true);
  const live = m ? data.members.find((x) => x.id === m.id) ?? m : null;
  const code = live && data.invites.find((i) => i.member_id === live.id)?.code;
  const justAdded = member === 'new' && !!m;

  async function submit() {
    const row = await saveMember({ ...(m ? { id: m.id } : {}), full_name: name.trim(), email, role: role.trim() || 'Board member', admin, active });
    if (!row) return false;
    if (!m) {
      // new person: create their code and keep the dialog open on it
      await newInvite(row);
      setSaved(row);
      return false;
    }
    return true;
  }

  const link = new URL('./', window.location.href).href;
  const message = live && code
    ? `Hi ${firstName(live.full_name)}, you are on the chapter board app.\nOpen ${link}, choose “First time here?” and use:\nEmail: ${live.email}\nInvite code: ${code}`
    : '';

  return (
    <Dialog
      open={!!member}
      title={justAdded ? `${firstName(m!.full_name)} is on the board` : m ? m.full_name : 'Add a member'}
      submitLabel={m ? 'Save' : 'Add member'}
      onClose={onClose}
      onSubmit={justAdded ? undefined : submit}
    >
      {!justAdded && (
        <div className="fields">
          <div className="fields two">
            <Field label="Full name">
              {(id) => <input id={id} className="input" required value={name} onChange={(e) => setName(e.target.value)} />}
            </Field>
            <Field label="Role">
              {(id) => <input id={id} className="input" placeholder="Treasurer" value={role} onChange={(e) => setRole(e.target.value)} />}
            </Field>
          </div>
          <Field label="Email" hint="The one they will sign in with.">
            {(id, d) => <input id={id} aria-describedby={d} className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Field>
          <label className="check">
            <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} disabled={m?.id === me.id} />
            <span>Admin<span className="hint">Can add people, change them and reset logins.</span></span>
          </label>
          {m && (
            <label className="check">
              <input type="checkbox" checked={!active} onChange={(e) => setActive(!e.target.checked)} disabled={m.id === me.id} />
              <span>Has left the board<span className="hint">They can no longer sign in. Their history stays.</span></span>
            </label>
          )}
        </div>
      )}

      {live && live.active && (
        <div className={`login-box${justAdded ? '' : ' below'}`}>
          {live.auth_user_id ? (
            <>
              <p><b>Login.</b> {firstName(live.full_name)} has signed in.</p>
              {live.id !== me.id && (
                <button type="button" className="btn small" onClick={async () => {
                  if (confirm(`Reset ${firstName(live.full_name)}’s login? They will need a new invite code to choose a new password.`)) await resetLogin(live);
                }}>Reset login (forgotten password)</button>
              )}
            </>
          ) : code ? (
            <>
              <p>Send this to {firstName(live.full_name)} privately. The code works once.</p>
              <span className="code num">{code}</span>
              <pre className="message">{message}</pre>
              <div className="actions">
                <button type="button" className="btn small" onClick={() => copyText(message).then(() => toast('Invite message copied.'))}><Copy /> Copy the message</button>
                <button type="button" className="btn small ghost" onClick={() => newInvite(live)}>New code</button>
              </div>
            </>
          ) : (
            <button type="button" className="btn small" onClick={() => newInvite(live)}>Create an invite code</button>
          )}
        </div>
      )}
    </Dialog>
  );
}
