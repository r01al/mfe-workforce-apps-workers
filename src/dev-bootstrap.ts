import { mountStandalone } from '@r01al/mfe-workforce-common-client/standalone';
import { demoWorkers } from '@r01al/mfe-workforce-common-client/testing';
import '@r01al/mfe-workforce-common-client/standalone.css';
import Workers from './Workers';

mountStandalone({
	component: Workers,
	redirectTo: '/workers',
	route: '/workers/*',
	workers: demoWorkers,
});
