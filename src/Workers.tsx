import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
	ArrowLeft, BriefcaseBusiness, CalendarDays, Check, ChevronRight, CirclePlus,
	Clock3, GraduationCap, Mail, MapPin, Pencil, Phone, Search, SlidersHorizontal,
	UserRound, X,
} from 'lucide-react';
import {
	Navigate, NavLink, Outlet, Route, Routes, useNavigate, useOutletContext, useParams, useSearchParams,
} from 'react-router-dom';
import { positions, type Position, type Worker } from '@r01al/mfe-workforce-common-client';
import { useWorkers } from '@r01al/mfe-workforce-common-client/hooks';
import './workers.css';

function formatHour(hour: number): string {
	return new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(new Date(2024, 0, 1, hour));
}

function AddWorkerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (worker: Worker) => void }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [position, setPosition] = useState<Position>('Sales Associate');

	const submit = (event: FormEvent) => {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName || !email.trim()) return;
		const initials = trimmedName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
		onAdd({
			id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
			name: trimmedName,
			initials,
			email: email.trim(),
			phone: 'Not provided',
			position,
			gender: 'Non-binary',
			age: 25,
			location: 'Downtown',
			joined: new Date().toISOString().slice(0, 10),
			status: 'Off today',
			color: '#6757d9',
			skills: [{ name: 'Orientation', level: 'Learning' }],
			shifts: [],
		});
	};

	return (
		<div className="modal is-active" role="dialog" aria-modal="true" aria-labelledby="add-worker-title">
			<button className="modal-background" onClick={onClose} aria-label="Close modal" />
			<form className="modal-card compact-modal" onSubmit={submit}>
				<header className="modal-card-head">
					<p className="modal-card-title" id="add-worker-title">Add a worker</p>
					<button className="delete" type="button" onClick={onClose} aria-label="Close" />
				</header>
				<section className="modal-card-body">
					<div className="field">
						<label className="label" htmlFor="worker-name">Full name</label>
						<div className="control"><input id="worker-name" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jamie Lee" autoFocus required /></div>
					</div>
					<div className="field">
						<label className="label" htmlFor="worker-email">Work email</label>
						<div className="control"><input id="worker-email" className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="jamie@company.com" required /></div>
					</div>
					<div className="field">
						<label className="label" htmlFor="worker-position">Position</label>
						<div className="control select is-fullwidth"><select id="worker-position" value={position} onChange={(event) => setPosition(event.target.value as Position)}>{positions.map((item) => <option key={item}>{item}</option>)}</select></div>
					</div>
				</section>
				<footer className="modal-card-foot">
					<button className="button is-small is-brand" type="submit">Add worker</button>
					<button className="button is-small is-quiet" type="button" onClick={onClose}>Cancel</button>
				</footer>
			</form>
		</div>
	);
}

function WorkerList({ workforce, onAdd }: { workforce: Worker[]; onAdd: (worker: Worker) => void }) {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [query, setQuery] = useState(() => searchParams.get('search') || '');
	const [position, setPosition] = useState('All positions');
	const [modalOpen, setModalOpen] = useState(false);
	const filtered = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return workforce.filter((worker) => (
			(position === 'All positions' || worker.position === position)
			&& (!normalized || `${worker.name} ${worker.email} ${worker.position}`.toLowerCase().includes(normalized))
		));
	}, [workforce, query, position]);

	const openWorker = (worker: Worker) => navigate(`/workers/${worker.id}/details`);
	const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, worker: Worker) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openWorker(worker);
		}
	};

	return (
		<section>
			<div className="page-heading">
				<div><h1>Workers</h1><p>{workforce.length} people across 2 locations.</p></div>
				<button className="button is-small is-brand" type="button" onClick={() => setModalOpen(true)}><CirclePlus size={13} /> Add worker</button>
			</div>

			<div className="workers-toolbar">
				<div className="workers-filters">
					<div className="control has-icons-left workers-search">
						<input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workers…" aria-label="Search workers" />
						<span className="icon is-small is-left"><Search size={13} /></span>
					</div>
					<div className="control has-icons-left">
						<div className="select is-small">
							<select value={position} onChange={(event) => setPosition(event.target.value)} aria-label="Filter by position">
								<option>All positions</option>
								{positions.map((item) => <option key={item}>{item}</option>)}
							</select>
						</div>
						<span className="icon is-small is-left"><SlidersHorizontal size={12} /></span>
					</div>
				</div>
				<span className="status-pill">{filtered.length} shown</span>
			</div>

			<div className="workers-table-wrap">
				<table className="table workers-table is-fullwidth">
					<thead><tr><th>Worker</th><th>Position</th><th>Location</th><th>Status</th><th>Age</th><th aria-label="Open" /></tr></thead>
					<tbody>
						{filtered.map((worker) => (
							<tr key={worker.id} tabIndex={0} onClick={() => openWorker(worker)} onKeyDown={(event) => onRowKeyDown(event, worker)} aria-label={`Open ${worker.name}`}>
								<td><div className="worker-cell"><span className="avatar avatar--md" style={{ '--avatar': worker.color } as React.CSSProperties}>{worker.initials}</span><span className="worker-cell-copy"><strong>{worker.name}</strong><span>{worker.email}</span></span></div></td>
								<td><span className="position-tag">{worker.position}</span></td>
								<td>{worker.location}</td>
								<td><span className={`status-pill ${worker.status === 'Working' ? 'working' : worker.status === 'On break' ? 'break' : ''}`}>{worker.status}</span></td>
								<td>{worker.age}</td>
								<td className="table-action"><ChevronRight size={14} /></td>
							</tr>
						))}
						{filtered.length === 0 && <tr><td className="table-empty" colSpan={6}>No workers match those filters.</td></tr>}
					</tbody>
				</table>
			</div>

			{modalOpen && <AddWorkerModal onClose={() => setModalOpen(false)} onAdd={(worker) => { onAdd(worker); setModalOpen(false); }} />}
		</section>
	);
}

function ProfileLayout({ workforce }: { workforce: Worker[] }) {
	const { workerId } = useParams();
	const worker = workforce.find((item) => item.id === workerId);
	if (!worker) return <Navigate to="/workers" replace />;

	return (
		<section>
			<NavLink className="profile-back" to="/workers"><ArrowLeft size={12} /> Back to workers</NavLink>
			<div className="profile-header">
				<div className="profile-person">
					<span className="avatar avatar--lg" style={{ '--avatar': worker.color } as React.CSSProperties}>{worker.initials}</span>
					<div><h1>{worker.name}</h1><p>{worker.position} · {worker.location}</p></div>
				</div>
				<span className={`status-pill ${worker.status === 'Working' ? 'working' : worker.status === 'On break' ? 'break' : ''}`}>{worker.status}</span>
			</div>
			<nav className="profile-tabs" aria-label="Worker profile">
				<NavLink className={({ isActive }) => `profile-tab${isActive ? ' active' : ''}`} to={`/workers/${worker.id}/details`}><UserRound size={13} /> Details</NavLink>
				<NavLink className={({ isActive }) => `profile-tab${isActive ? ' active' : ''}`} to={`/workers/${worker.id}/skills`}><GraduationCap size={13} /> Skills</NavLink>
				<NavLink className={({ isActive }) => `profile-tab${isActive ? ' active' : ''}`} to={`/workers/${worker.id}/schedule`}><CalendarDays size={13} /> Schedule</NavLink>
			</nav>
			<Outlet context={worker} />
		</section>
	);
}

function WorkerDetails() {
	const worker = useOutletContext<Worker>();
	const [editing, setEditing] = useState(false);
	const [phone, setPhone] = useState(worker.phone);
	const [location, setLocation] = useState(worker.location);

	return (
		<div className="profile-layout">
			<article className="panel-card">
				<div className="panel-header">
					<div><h2>Personal details</h2><p>Contact and employment information</p></div>
					<button className="button is-small is-quiet" type="button" onClick={() => setEditing((value) => !value)}>{editing ? <Check size={12} /> : <Pencil size={12} />}{editing ? 'Done' : 'Edit'}</button>
				</div>
				<div className="detail-grid">
					<div className="detail-item"><span>Full name</span><strong><UserRound size={13} />{worker.name}</strong></div>
					<div className="detail-item"><span>Work email</span><strong><Mail size={13} />{worker.email}</strong></div>
					<div className="detail-item"><span>Phone</span>{editing ? <input className="input" value={phone} onChange={(event) => setPhone(event.target.value)} /> : <strong><Phone size={13} />{phone}</strong>}</div>
					<div className="detail-item"><span>Location</span>{editing ? <div className="select is-fullwidth"><select value={location} onChange={(event) => setLocation(event.target.value)}><option>Downtown</option><option>Riverside</option></select></div> : <strong><MapPin size={13} />{location}</strong>}</div>
					<div className="detail-item"><span>Position</span><strong><BriefcaseBusiness size={13} />{worker.position}</strong></div>
					<div className="detail-item"><span>Joined</span><strong><CalendarDays size={13} />{new Date(`${worker.joined}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
				</div>
			</article>
			<aside className="panel-card">
				<div className="panel-header"><div><h2>At a glance</h2><p>Current profile summary</p></div></div>
				<div className="profile-aside-list">
					<div className="profile-aside-stat"><span>Age</span><strong>{worker.age}</strong></div>
					<div className="profile-aside-stat"><span>Gender</span><strong>{worker.gender}</strong></div>
					<div className="profile-aside-stat"><span>Skills</span><strong>{worker.skills.length}</strong></div>
					<div className="profile-aside-stat"><span>Weekly shifts</span><strong>{worker.shifts.length}</strong></div>
				</div>
			</aside>
		</div>
	);
}

function WorkerSkills() {
	const worker = useOutletContext<Worker>();
	const [skills, setSkills] = useState(worker.skills);
	const addSkill = () => {
		if (!skills.some((skill) => skill.name === 'Product knowledge')) {
			setSkills((current) => [...current, { name: 'Product knowledge', level: 'Learning' }]);
		}
	};
	return (
		<article className="panel-card">
			<div className="panel-header">
				<div><h2>Skills & certifications</h2><p>Capabilities recorded for {worker.name}</p></div>
				<button className="button is-small is-brand" type="button" onClick={addSkill}><CirclePlus size={12} /> Add skill</button>
			</div>
			<div className="skill-list">
				{skills.map((skill) => (
					<div className="skill-row" key={skill.name}>
						<div className="skill-name"><span className="skill-icon"><Check size={13} /></span><span>{skill.name}</span></div>
						<span className="skill-level">{skill.level}</span>
					</div>
				))}
			</div>
		</article>
	);
}

function WorkerSchedule() {
	const worker = useOutletContext<Worker>();
	const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	return (
		<article className="panel-card">
			<div className="panel-header"><div><h2>Regular schedule</h2><p>Recurring weekly hours for {worker.name}</p></div><span className="status-pill"><Clock3 size={10} /> {worker.shifts.reduce((total, shift) => total + shift.endHour - shift.startHour, 0)}h / week</span></div>
			<div className="schedule-list">
				{days.map((day, index) => {
					const shift = worker.shifts.find((item) => item.weekday === index + 1);
					return (
						<div className="schedule-row" key={day}>
							<strong>{day}</strong>
							<div className="schedule-line">{shift && <span style={{ width: `${Math.min(100, ((shift.endHour - shift.startHour) / 10) * 100)}%` }} />}</div>
							<time>{shift ? `${formatHour(shift.startHour)} – ${formatHour(shift.endHour)}` : 'Day off'}</time>
						</div>
					);
				})}
			</div>
		</article>
	);
}

export default function Workers() {
	const { workers, loading, error } = useWorkers();
	const [addedWorkers, setAddedWorkers] = useState<Worker[]>([]);
	if (loading) return <div className="mfe-loading" role="status">Loading workers…</div>;
	if (error) return <div className="mfe-error" role="alert">Unable to load workers: {error}</div>;
	const workforce = [...addedWorkers, ...workers];
	return (
		<Routes>
			<Route index element={<WorkerList workforce={workforce} onAdd={(worker) => setAddedWorkers((current) => [worker, ...current])} />} />
			<Route path=":workerId" element={<ProfileLayout workforce={workforce} />}>
				<Route index element={<Navigate to="details" replace />} />
				<Route path="details" element={<WorkerDetails />} />
				<Route path="skills" element={<WorkerSkills />} />
				<Route path="schedule" element={<WorkerSchedule />} />
				<Route path="*" element={<Navigate to="details" replace />} />
			</Route>
			<Route path="*" element={<Navigate to="/workers" replace />} />
		</Routes>
	);
}
