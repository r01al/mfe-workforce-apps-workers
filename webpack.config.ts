import { createRemoteConfig, type BuildArguments } from '@r01al/mfe-workforce-common-server/build';
const appDirectory = process.cwd();

export default (environment: Record<string, unknown>, argv: BuildArguments) => createRemoteConfig({
	name: 'workers',
	appDirectory,
	port: 3005,
	exposes: { './Workers': './src/Workers' },
	standalone: {
		entry: './src/dev.ts',
		title: 'Workforce Workers',
	},
}, environment, argv);
