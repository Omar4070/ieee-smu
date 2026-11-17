import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { initials } from '../lib/rules';
import type { Member } from '../lib/types';
import { useStore } from '../store';

/** The chapter's mark: the three phases of its logo, in logo order. */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 24" fill="none" strokeWidth="3.2" strokeLinecap="round">
        <path d="M2 6C7 6 7 20 10 20C13 20 13 6 18 6" stroke="var(--phase-ias)" />
        <path d="M16 6C21 6 21 20 24 20C27 20 27 6 32 6" stroke="var(--phase-ies)" />
        <path d="M30 6C35 6 35 20 38 20C41 20 41 6 46 6" stroke="var(--phase-pes)" />
      </svg>
    </span>
  );
}

export function Avatar({ member, hue }: { member: Member | undefined; hue?: number }) {
  const store = useStore();
  return (
    <span className="avatar" style={{ ['--h' as string]: hue ?? store.hue(member?.id) }} aria-hidden="true">
      {member ? initials(member.full_name) : '?'}
    </span>
  );
}

/** A person with their tint, or a grey dash when nobody is set. */
export function Person({ member, short, fallback = '–' }: { member: Member | undefined; short?: boolean; fallback?: string }) {
  if (!member) return <span className="faint">{fallback}</span>;
  return (
    <span className="person" title={member.full_name}>
      <Avatar member={member} />
      <span className="name">{short ? member.full_name.split(/\s+/)[0] : member.full_name}</span>
    </span>
  );
}

export function Pill({ tone, children }: { tone?: 'pos' | 'neg' | 'warn'; children: ReactNode }) {
  return <span className={`pill${tone ? ` ${tone}` : ''}`}>{children}</span>;
}

export function Segmented<T extends string>(props: {
  label: string;
  value: T | undefined;
  options: { value: T; label: string; className?: string }[];
  onChange(v: T): void;
  className?: string;
}) {
  return (
    <div className={`segmented${props.className ? ` ${props.className}` : ''}`} role="group" aria-label={props.label}>
      {props.options.map((o) => (
        <button key={o.value} type="button" className={o.className} aria-pressed={props.value === o.value} onClick={() => props.onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A labelled field; the control gets the id and the hint through aria-describedby. */
export function Field(props: { label: string; hint?: ReactNode; wide?: boolean; children: (id: string, describedBy?: string) => ReactNode }) {
  const id = useId();
  const hintId = props.hint ? `${id}-hint` : undefined;
  return (
    <div className={`field${props.wide ? ' wide' : ''}`}>
      <label htmlFor={id}>{props.label}</label>
      {props.children(id, hintId)}
      {props.hint && <span id={hintId} className="hint">{props.hint}</span>}
    </div>
  );
}

/**
 * A modal form on the native <dialog>: focus moves in, Escape closes, focus returns.
 * `onSubmit` returns false to stay open.
 */
export function Dialog(props: {
  open: boolean;
  title: string;
  onClose(): void;
  onSubmit?(): Promise<boolean | void> | boolean | void;
  submitLabel?: string;
  /** Extra buttons on the left of the footer (Delete…). */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (props.open && !d.open) d.showModal();
    if (!props.open && d.open) d.close();
  }, [props.open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!props.onSubmit) return props.onClose();
    const r = await props.onSubmit();
    if (r !== false) props.onClose();
  }

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={props.onClose}
      onCancel={(e) => { e.preventDefault(); props.onClose(); }}
      onClick={(e) => { if (e.target === ref.current) props.onClose(); }}
    >
      {props.open && (
        <form className="sheet-form" onSubmit={submit}>
          <div className="sheet-head">
            <h2 id={titleId}>{props.title}</h2>
            <button type="button" className="icon-btn" onClick={props.onClose} aria-label="Close">
              <X />
            </button>
          </div>
          <div className="sheet-body">{props.children}</div>
          <div className="sheet-foot">
            {props.footer}
            <span className="spacer" />
            {props.onSubmit ? (
              <>
                <button type="button" className="btn" onClick={props.onClose}>Cancel</button>
                <button type="submit" className="btn primary">{props.submitLabel ?? 'Save'}</button>
              </>
            ) : (
              <button type="button" className="btn primary" onClick={props.onClose}>Done</button>
            )}
          </div>
        </form>
      )}
    </dialog>
  );
}

/** Sets the browser tab's title for each screen. */
export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Chapter board`;
  }, [title]);
}
