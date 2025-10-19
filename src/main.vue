<template lang="pug">
#head
	#head-logo Overseer
	#head-stats
		div {{ fmt(stats.chatMessages, 'chat message') }}
	#head-status
		div(
			:state="clientState.connected ? 'good' : 'bad'"
		) Chat
		div(
			:state="clientState.channelsJoined.size > 0 ? 'good' : 'bad'"
		) {{ fmt(clientState.channelsJoined.size, 'Channel') }}
	#head-buttons
		.button(@click="settingsIsOpen = !settingsIsOpen" tabindex="0")
			.icon(icon="settings")
#settings(:showing="settingsIsOpen")
	#settings-head
		#settings-head-text {{ settingsSearch.trim().length ? 'Settings (Filtered)' : 'Settings' }}
		#settings-head-search
			input(v-model="settingsSearch" placeholder="Search")
			.button(@click="settingsSearch = ''")
				.icon(icon="close" tabindex="0")
		#settings-head-buttons
			.button(title="Close" @click="settingsIsOpen = false" tabindex="0")
				.icon(icon="close")
	#settings-body
		// .flex-col
			OverseerEventNewSubs(:e="{ channel: { id: 1, login: 'testchannel', display: 'TestChannel' }, user: { id: 2, login: 'demouser', display: 'DemoUser' }, data: { tier: 1 } }")
			OverseerEventNewSubs(:e="{ channel: { id: 1, login: 'testchannel', display: 'TestChannel' }, user: { id: 2, login: 'demouser', display: 'DemoUser' }, data: { tier: 1, months: 6 } }")
			OverseerEventGiftedSubs(
				:e="{ eventId: `demo:${Math.random().toString()}`, channel: { id: 1, login: 'testchannel', display: 'TestChannel' }, user: { id: 2, login: 'demouser', display: 'DemoUser' }, data: { tier: 1, isPrime: false, months: 1, recipient: { id: 3, login: 'recipient', display: 'Recipient' } } }"
				:settings="settings"
				:giftedSubsDetailsCheckboxMap="giftedSubsDetailsCheckboxMap"
			)
		template(v-for="group in settingsDescFiltered" :key="group.key")
			h1 {{ group.name }}
			.setting-desc(
				v-for="item in [ ...group.list, ...group.sub.flatMap(n => [ { type: 'sub', key: n.key, name: n.name }, ...n.list ]) ]"
				:key="item.key"
				:type="item.type"
			)
				template(v-if="item.type === 'hue'")
					.flex
						.setting-desc__name {{ (item.name || `(name empty for item.key: "${item.key}")`) ?? `(name missing for item.key: "${item.key}")` }}
						.setting-desc__reset(
							:title="settingResetTitle(item)"
							@click="settingReset(item)"
							:is-default="settingIsDefault(item)"
							tabindex="0"
						)
					.setting-desc__description(v-if="item.desc") {{ item.desc }}
					.flex
						input(v-model.trim="settings[item.key]" type="number" min="0" max="360")
						.picker-container(
							@click="settings[item.key] = pickerGetHue($event)"
							@mousemove="$event.target.matches(':active') && (settings[item.key] = pickerGetHue($event))"
						)
							.picker-big(:style="{ '--picker-pos': `${settings[item.key] / 3.6 % 100}%` }")
				template(v-else-if="item.type === 'boolean'")
					.flex
						label
							input(type="checkbox" v-model="settings[item.key]")
							.icon(tabindex="0")
							=' '
							.setting-desc__name {{ (item.name || `(name empty for item.key: "${item.key}")`) ?? `(name missing for item.key: "${item.key}")` }}
						.setting-desc__reset(
							:title="settingResetTitle(item)"
							@click="settingReset(item)"
							:is-default="settingIsDefault(item)"
							tabindex="0"
						)
					.setting-desc__description(v-if="item.desc") {{ item.desc }}
				template(v-else-if="item.type === 'number'")
					.flex
						label
							input(type="number" v-model.number="settings[item.key]" :min="item.min" :max="item.max")
							=' '
							.setting-desc__name {{ (item.name || `(name empty for item.key: "${item.key}")`) ?? `(name missing for item.key: "${item.key}")` }}
						.setting-desc__reset(
							:title="settingResetTitle(item)"
							@click="settingReset(item)"
							:is-default="settingIsDefault(item)"
							tabindex="0"
						)
					.setting-desc__description(v-if="item.desc") {{ item.desc }}
				template(v-else-if="item.type === 'select'")
					.flex
						label
							select(v-model="settings[item.key]")
								option(v-for="opt in item.options" :key="opt.value" :value="opt.value") {{ opt.display }}
								=' '
							.setting-desc__name {{ (item.name || `(name empty for item.key: "${item.key}")`) ?? `(name missing for item.key: "${item.key}")` }}
						.setting-desc__reset(
							:title="settingResetTitle(item)"
							@click="settingReset(item)"
							:is-default="settingIsDefault(item)"
							tabindex="0"
						)
					.setting-desc__description(v-if="item.desc") {{ item.desc }}
				template(v-else-if="item.type === 'sub'")
					h2(v-if="item.name") {{ item.name }}
				template(v-else="")
					div(style="style: #f44; font-weight: bold;") Setting type unsupported: {{ item.type ?? item }}
// #events_column(:theme_colorizeNames="settings.theme_colorizeNames")
#events(:theme_colorizeNames="settings.theme_colorizeNames")
	.event-container-row(
		style="grid-auto-columns: minmax(max-content, 5fr) minmax(max-content, 9fr) minmax(max-content, 5fr);"
	)
		.event-container
			.event-title
				.event-title-text New Subs
				.event-badge {{ fmt(events.newSubs.length, 'new sub') }}
				button(v-if="settings.demo_showButtons" @click="demo('newSubs')") Demo
			.event-items(ref="eventRefs.newSubs")
				OverseerEventNewSubs(v-for="e in events.newSubs" :key="e.eventId" :e="e")
			.more-events(@click="scrollEvents(eventRefs.newSubs)")
		.event-container
			.event-title
				.button(@click="giftDetailsFoldAll" title="Close All")
					.icon(icon="fold_all")
				.button(@click="giftDetailsUnfoldAll" title="Open All")
					.icon(icon="unfold_all")
				.event-title-text Gifted Subs
				.event-badge {{ fmt(totalGiftSubs, 'total sub') }}
				button(v-if="settings.demo_showButtons" @click="demo('giftedSubs')") Demo
			.event-items(ref="eventRefs.giftedSubs")
				OverseerEventGiftedSubs(
					v-for="e in events.giftedSubs"
					:key="e.eventId"
					:e="e"
					:settings="settings"
					:giftedSubsDetailsCheckboxMap="giftedSubsDetailsCheckboxMap"
				)
			.more-events(@click="scrollEvents(eventRefs.giftedSubs)")
		// .event-container
			.event-title
				.event-title-text Follows
		.event-container
			.event-title
				.event-title-text Raids
				.event-badge {{ fmt(events.raids.length, 'total raid') }}
				button(v-if="settings.demo_showButtons" @click="demo('raids')") Demo
			.event-items(ref="eventRefs.raids")
				OverseerEventRaids(v-for="e in filteredRaids" :key="e.eventId" :e="e")
			.more-events(@click="scrollEvents(eventRefs.raids)")
	.event-container-row
		.event-container
			.event-title
				.event-title-text Resubs
				.event-badge {{ fmt(events.resubs.length, 'total resub') }}
				button(v-if="settings.demo_showButtons" @click="demo('resubs')") Demo
			.event-items(ref="eventRefs.resubs")
				OverseerEventResubs(
					v-for="e in events.resubs"
					:key="e.eventId"
					:e="e"
					:settings="settings"
					@clickEmote="showEmote"
				)
			.more-events(@click="scrollEvents(eventRefs.resubs)")
		// .event-container
			.event-title
				.event-title-text Tips
		.event-container
			.event-title
				.event-title-text Bits
				.event-badge(
					:title="badgeEventBitsTotalTitle"
				) {{ n(totalBits) }} total Bits
				button(v-if="settings.demo_showButtons" @click="demo('bits')") Demo
			.event-items(ref="eventRefs.bits")
				OverseerEventBits(
					v-for="e in filteredBits"
					:key="e.eventId"
					:e="e"
					:settings="settings"
					@clickEmote="showEmote"
				)
			.more-events(@click="scrollEvents(eventRefs.bits)")
#big-emote(:show="Boolean(bigEmoteState.image)")
	#big-emote-scrim(@click.self="bigEmoteClose")
	#big-emote-container
		#big-emote-close(@click="bigEmoteClose")
		#big-emote-name {{ bigEmoteState.name }}
		#big-emote-image(
			:style="{ backgroundImage: `url(${bigEmoteState.image})` }"
			ref="bigEmoteImageRef"
		)
		#big-emote-buttons
			a.button(
				:href="bigEmoteState.image"
				target="_blank"
				title="Open image in new tab"
			)
				.icon(icon="open_external")
</template>

<script setup>
	import { ref, shallowRef, reactive, watch, computed, useTemplateRef, nextTick, onMounted } from 'vue';
	import tmi from 'https://unpkg.com/@tmi.js/chat@0.6.1/dist/tmi.browser.min.mjs';

	import {
		STORAGE_KEYS,
		s, n, fmt, formatUsername,
		loadCheermotes, getCheermotes,
	} from 'https://codepen.io/Alca/pen/GgoMOOG.js';

	import OverseerTimestamp from 'https://codepen.io/Alca/pen/RNrVBxO.js';
	import OverseerMessage from 'https://codepen.io/Alca/pen/KwVmEXg.js';

	import OverseerEventNewSubs from 'https://codepen.io/Alca/pen/ogbGoew.js';
	import OverseerEventGiftedSubs from 'https://codepen.io/Alca/pen/raxGpvp.js';
	import OverseerEventRaids from 'https://codepen.io/Alca/pen/vELeWMa.js';
	import OverseerEventResubs from 'https://codepen.io/Alca/pen/KwVXZMz.js';
	import OverseerEventBits from 'https://codepen.io/Alca/pen/xbZXpPz.js';

	const eventRefs = {
		newSubs: useTemplateRef('eventRefs.newSubs'),
		giftedSubs: useTemplateRef('eventRefs.giftedSubs'),
		raids: useTemplateRef('eventRefs.raids'),
		resubs: useTemplateRef('eventRefs.resubs'),
		bits: useTemplateRef('eventRefs.bits'),
	};

	const stats = reactive({
		chatMessages: 0,
	});

	const settingsIsOpen = ref(false);
	const settings = reactive({
		theme_hue: 225,
		theme_colorizeNames: true,
		events_showMoreButton: true,
		events_maxEventsPerCategory: 800,
		giftSubs_autoExpand: true,
		giftSubs_expandThresholdToggle: false,
		giftSubs_expandThreshold: 50,
		giftSubs_mysterySingle: true,
		raids_minimumViewers: 0,
		bits_minimumCheer: 0,
		bits_rewardCost_gigantifiedEmote: 0,
		bits_rewardCost_messageEffects: 0,
		bits_combineCheermotes: 'adjacent',
		demo_showButtons: false,
		demo_streamLanguage: 'none',
		debug_chat_dontConnect: false,
		debug_message_doLog: false,
	});

	const settingsSearch = ref('');
	const settingsDesc = [
		{
			key: 'theme', name: 'Theme',
			list: [
				{
					key: 'theme_hue', name: 'Hue',
					type: 'hue', default: 225,
					desc: '',
				}, {
					key: 'theme_colorizeNames', name: 'Colorize usernames',
					type: 'boolean', default: true,
					desc: '',
				}
			],
			sub: [],
		}, {
			key: 'feeds', name: 'Feeds',
			list: [],
			sub: [
				{
					key: 'meta', name: '',
					list: [
						{
							key: 'events_showMoreButton', name: 'Show "More" button',
							type: 'boolean', default: true,
							desc: '',
						},
					]
				},
			],
		}, {
			key: 'events', name: 'Events',
			list: [],
			sub: [
				{
					key: 'giftedSubs', name: 'Gifted Subs',
					list: [
						{
							key: 'giftSubs_autoExpand', name: 'Auto expand',
							type: 'boolean', default: true,
							desc: '',
						}, {
							key: 'giftSubs_expandThresholdToggle', name: 'Use auto expand threshold',
							type: 'boolean', default: false,
							desc: ''
						}, {
							key: 'giftSubs_expandThreshold', name: 'Auto expand threshold',
							type: 'number', default: 50,
							min: 1, max: 1000,
							desc: 'If auto expand is enabled, the user list will automatically expand for a gift count less than or equal to this value.',
						}, {
							key: 'giftSubs_mysterySingle', name: 'Show name for single, random gifts',
							type: 'boolean', default: true,
							desc: 'Directly show the name when a single gift sub was randomly picked instead of a list.'
						}
					]
				}, {
					keys: 'raids', name: 'Raids',
					list: [
						{
							key: 'raids_minimumViewers', name: 'Minimum raid viewers',
							type: 'number', default: 1,
							min: 1, max: 10000000,
							desc: 'Hide raids with viewers less than this value.',
						}
					]
				}, {
					key: 'bits', name: 'Bits',
					list: [
						{
							key: 'bits_minimumCheer', name: 'Minimum Cheer Bits',
							type: 'number', default: 1,
							min: 1, max: 1000000,
							desc: 'Hide Cheers with Bits less than this value.',
						}, {
							key: 'bits_rewardCost_gigantifiedEmote', name: 'Reward cost in Bits for Gigantified Emotes',
							type: 'number', default: 0,
							min: 0, max: 1000000,
							desc: 'Affects the total value and will be displayed in the badge next to the message. A value of 0 won\'t be counted.',
						}, {
							key: 'bits_rewardCost_messageEffects', name: 'Reward cost in Bits for Message Effects',
							type: 'number', default: 0,
							min: 0, max: 1000000,
							desc: 'Affects the total value and will be displayed in the badge next to the message. A value of 0 won\'t be counted.',
						}, {
							key: 'bits_combineCheermotes', name: 'Combine Cheermotes',
							type: 'select', default: 'adjacent',
							options: [
								{ value: 'none', display: 'None' },
								{ value: 'adjacent', display: 'Adjacent' },
								{ value: 'all', display: 'All' },
							],
							desc: 'Simplify the look of bits to reduce spam.',
						},
					]
				}
			]
		}, {
			key: 'demo', name: 'Demo',
			list: [
				{
					key: 'demo_showButtons', name: 'Show demo buttons',
					type: 'boolean', default: false,
					desc: '',
				}, {
					key: 'demo_streamLanguage', name: 'Demo mode stream language',
					type: 'select', default: 'none',
					options: [
						{ value: 'none', display: 'Default' },
						{ value: 'en', display: 'English' },
					],
					desc: 'When in demo mode, it will join the top ~100 streams on Twitch, including all languages. Requires reload.',
				},
			],
			sub: []
		}, {
			key: 'debug', name: 'Debug',
			list: [
				{
					key: 'debug_chat_dontConnect', name: 'Do not connect to chat',
					type: 'boolean', default: false,
					desc: 'Requires reload.',
				}, {
					key: 'debug_message_doLog', name: 'Log OverseerMessage data',
					type: 'boolean', default: false,
					desc: 'Can be very spammy in the console if not limited.',
				},
			],
			sub: []
		},
	];
	const settingsDescFiltered = computed(() => {
		const searchValue = settingsSearch.value.toLowerCase().trim();
		return !searchValue ? settingsDesc : settingsDesc.map(({ list, sub, ...rest }) => {
			return {
				...rest,
				list: list.filter(n => n.name.toLowerCase().includes(searchValue) || n.desc.toLowerCase().includes(searchValue)),
				sub: sub.map(({ list, ...rest }) => {
					return {
						...rest,
						list: list.filter(n => n.name.toLowerCase().includes(searchValue) || n.desc.toLowerCase().includes(searchValue)),
					};
				})
				.filter(n => n.list.length)
			};
		})
		.filter(n => n.list.length || n.sub.length);
	});
	function settingIsDefault(item) {
		if(!item.key) {
			console.warn('Cannot get settings item (missing key)', item);
			return;
		}
		else if((item.key in settings) === false) {
			console.warn('Cannot get settings item (key not in settings)', item);
			return;
		}
		else if(('default' in item) === false) {
			// Can't tell
			return true;
		}
		switch(item.type) {
			case 'number': {
				const settingValue = settings[item.key];
				if(typeof settingValue !== 'number') {
					return parseFloat(settingValue) === item.default;
				}
				return settingValue === item.default;
			}
		}
		return settings[item.key] === item.default;
	}
	function settingResetTitle(item) {
		if(('default' in item) === false) {
			return '';
		}
		else if(settingIsDefault(item)) {
			return 'Currently default';
		}
		else if(item.type === 'select') {
			return `Reset to ${item.options?.find(n => n.value === item.default)?.display ?? '(unknown)'}`;
		}
		return `Reset to ${item.default}`;
	}
	function settingReset(item) {
		if(!item.key) {
			console.warn('Cannot reset settings item (missing key)', item);
			return;
		}
		else if((item.key in settings) === false) {
			console.warn('Cannot reset settings item (key not in settings)', item);
			return;
		}
		else if(('default' in item) === false) {
			console.warn('Cannot reset settings item (no default value)', item);
			return;
		}
		// console.log(`Setting ${item.key} (${JSON.stringify(settings[item.key])}) to ${JSON.stringify(item.default)}`);
		settings[item.key] = item.default;
	}

	loadSettings();
	watch(settings, (newValue, oldValue) => {
		const theme_hue = parseFloat(settings.theme_hue);
		if(theme_hue !== theme_hue) {
			settings.theme_hue = oldValue.theme_hue;
		}

		if(settings.bits_rewardCost_gigantifiedEmote === '') {
			settings.bits_rewardCost_gigantifiedEmote = 0;
		}
		else {
			const bits_rewardCost_gigantifiedEmote = parseFloat(settings.bits_rewardCost_gigantifiedEmote);
			if(bits_rewardCost_gigantifiedEmote !== bits_rewardCost_gigantifiedEmote) {
				settings.bits_rewardCost_gigantifiedEmote = oldValue.bits_rewardCost_gigantifiedEmote;
			}
		}
		if(settings.bits_rewardCost_messageEffects === '') {
			settings.bits_rewardCost_messageEffects = 0;
		}
		else {
			const bits_rewardCost_messageEffects = parseFloat(settings.bits_rewardCost_messageEffects);
			if(bits_rewardCost_messageEffects !== bits_rewardCost_messageEffects) {
				settings.bits_rewardCost_messageEffects = oldValue.bits_rewardCost_messageEffects;
			}
		}

		saveSettings();
		applySettings();
	});

	function pickerGetHue(e) {
		function pickerSetWithPadding(x, width) {
			const padding = 8; // 0.5rem
			return Math.min(1, Math.max(0, (x - padding) / (width - padding * 2)));
		}
		return Math.floor(pickerSetWithPadding(e.offsetX, e.target.scrollWidth) * 360 * 10) / 10;
	}

	function applySettings() {
		if(!settings.events_showMoreButton) {
			for(const key in eventRefs) {
				const ele = eventRefs[key].value;
				ele.parentElement.classList.remove('has-more-events');
			}
		}

		const hue = parseFloat(settings.theme_hue);
		if(hue === hue) {
			document.documentElement.style.setProperty('--theme-hue', `${settings.theme_hue}`);
		}
	}
	function loadSettings() {
		const json = localStorage.getItem(STORAGE_KEYS.settings);
		if(!json) {
			return;
		}
		let data;
		try {
			data = JSON.parse(json);
		} catch(err) {
			return;
		}
		for(const key in data) {
			const value = data[key];
			if(key in settings) {
				settings[key] = value;
			}
		}
	}
	function saveSettings() {
		const json = JSON.stringify(settings);
		localStorage.setItem(STORAGE_KEYS.settings, json);
	}

	const bigEmoteState = reactive({ id: '', name: '', image: '' });
	const bigEmoteImage = useTemplateRef('bigEmoteImageRef');
	const bigEmoteClose = () => {
		bigEmoteState.image = '';
		bigEmoteImage.value.style.width = '112px';
	};

	class EventEmitter {
		constructor() {
			this.listeners = {};
		}
		on(eventName, callback) {
			this.listeners[eventName] ??= [];
			this.listeners[eventName].push(callback);
		}
		emit(eventName, ...data) {
			const listeners = this.listeners[eventName] ?? [];
			listeners.forEach(cb => cb(...data));
		}
	}

	class Mystery extends EventEmitter {
		static from(e) {
			const m = new Mystery(
				e.mystery.id,
				e.mystery.count,
				e.channel,
				{ id: e.user.id, login: e.user.login, display: e.user.display },
				e.plan.tier
			);
			return m;
		}
		static fromGift(e) {
			if(!e.mystery) {
				throw new Error('Gift is not a mystery', { cause: e });
			}
			const m = new Mystery(e.mystery.id, 0, e.channel, e.user, e.plan.tier);
			m.addGift(e);
			return m;
		}
		constructor(id, targetCount, channel, gifter, tier) {
			super();
			this.id = id;
			this.targetCount = targetCount;
			this.channel = channel;
			this.gifter = gifter;
			this.tier = tier;
			const now = Date.now();
			this.createdAt = now;
			this.lastUpdatedAt = now;
			this.gifts = [];
		}
		update() {
			// const now = Date.now();
			// if(this.lastUpdatedAt + 10_000 < now) {
			// // }
			if(!this.gifter) {
				// Waiting for the gifter to be set
				return;
			}
			else if(!this.targetCount) {
				// Waiting for the target count to be set
				return;
			}
			if(this.gifts.length > this.targetCount) {
				throw new Error(`Too many gifts (${this.gifts.length} > ${this.targetCount})`, { cause: this });
			}
			else if(this.gifts.length < this.targetCount) {
				// Waiting for the gifts count to match the target count
				return;
			}
			this.emit('done');
		}
		addGift(e) {
			if(!e.mystery) {
				throw new Error('Gift is not a mystery', { cause: e });
			}
			else if(e.mystery.id !== this.id) {
				throw new Error(`Gift mystery ID mismatch (found: ${e.mystery.id}, expected: ${this.id})`, { cause: e });
			}
			this.lastUpdatedAt = Date.now();
			if(!this.gifter) {
				this.gifter = { id: e.user.id, login: e.user.login, display: e.user.display };
			}
			this.gifts.push({ user: e.recipient, cumulativeMonths: e.cumulativeMonths });
			this.update();
		}
		addMystery(e) {
			if(!e.mystery) {
				throw new Error('Event is not a mystery', { cause: e });
			}
			this.lastUpdatedAt = Date.now();
			this.gifter = { id: e.user.id, login: e.user.login, display: e.user.display };
			this.targetCount = e.mystery.count;
			this.update();
		}
	}
	const mysteryList = new Map();

	onMounted(() => {
		applySettings();

		for(const key in eventRefs) {
			const ele = eventRefs[key].value;
			let raf;
			ele.addEventListener('scroll', () => {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(() => {
					const isOnBottom = ele.scrollTop + ele.clientHeight + 36 >= ele.scrollHeight;
					if(isOnBottom) {
						ele.parentElement?.classList.remove('has-more-events');
					}
				});
			}, { passive: true });
		}
	});

	const demoUuidList = new Set();

	const events = reactive({
		newSubs: [],
		giftedSubs: [],
		raids: [],
		resubs: [],
		bits: [],
	});

	const filteredRaids = computed(() => {
		if(settings.raids_minimumViewers <= 1) {
			return events.raids;
		}
		return events.raids.filter(n => {
			return n.data.viewers >= settings.raids_minimumViewers;
		});
	});
	const filteredBits = computed(() => {
		if(settings.bits_minimumCheer <= 1) {
			return events.bits;
		}
		return events.bits.filter(n => {
			if(n.data.rewardType) {
				return true;
			}
			return n.data.bits >= settings.bits_minimumCheer;
		});
	});

	const giftedSubsDetailsCheckboxMap = ref(new Map());

	function giftDetailsFoldAll() {
		giftedSubsDetailsCheckboxMap.value.forEach((_, k) => giftedSubsDetailsCheckboxMap.value.set(k, false));
	}
	function giftDetailsUnfoldAll() {
		giftedSubsDetailsCheckboxMap.value.forEach((_, k) => giftedSubsDetailsCheckboxMap.value.set(k, true));
	}

	const totalGiftSubs = computed(() => {
		return events.giftedSubs.reduce((p, n) => {
			if(n.data.type === 'mystery') {
				return p + n.data.count;
			}
			return p + 1;
		}, 0);
	});
	const totalBits = computed(() => {
		return events.bits.reduce((p, n) => {
			if(
				n.data.rewardType === 'gigantifiedEmote' &&
				typeof settings.bits_rewardCost_gigantifiedEmote === 'number' &&
				settings.bits_rewardCost_gigantifiedEmote === settings.bits_rewardCost_gigantifiedEmote
			) {
				return p + settings.bits_rewardCost_gigantifiedEmote;
			}
			else if(
				n.data.rewardType === 'messageEffects' &&
				typeof settings.bits_rewardCost_messageEffects === 'number' &&
				settings.bits_rewardCost_messageEffects === settings.bits_rewardCost_messageEffects
			) {
				return p + settings.bits_rewardCost_messageEffects;
			}
			return p + n.data.bits;
		}, 0);
	});
	const totalPowerUps = computed(() => {
		return events.bits.reduce((p, n) => {
			if(n.data.rewardType) {
				return p + 1;
			}
			return p;
		}, 0);
	});
	const badgeEventBitsTotalTitle = computed(() => {
		const cheersCount = events.bits.length - totalPowerUps.value;
		return `${fmt(totalPowerUps.value, 'Power-Up')}, ${fmt(cheersCount, 'Cheer')}`;
	});

	function showEmote({ id, name, image }) {
		bigEmoteState.id = id;
		bigEmoteState.name = name;
		bigEmoteState.image = image;
	}

	function scrollEvents(eleRef) {
		const ele = eleRef.value;
		ele.parentElement?.classList.toggle('has-more-events', false);
		ele.lastElementChild?.scrollIntoView({ behavior: 'instant', block: 'end', container: 'nearest' });
	}

	function addEvent(type, channelData, user, data, timestamp = Date.now()) {
		const eventId = crypto.randomUUID();
		const channel = { id: channelData.id, login: channelData.login };
		const event = { eventId, timestamp, channel, user, data };
		if(!events[type]) {
			throw new Error(`No array for event type ${type}`, { cause: event });
		}
		const listElement = eventRefs[type]?.value;
		if(!listElement) {
			throw new Error(`No list element for event type ${type}`, { cause: event });
		}
		const isOnBottom = listElement.scrollTop + listElement.clientHeight + 36 >= listElement.scrollHeight;
		events[type]?.push(event);
		if((events[type]?.length ?? 0) > settings.events_maxEventsPerCategory) {
			events[type] = events[type].slice(-800);
		}
		if(settings.events_showMoreButton) {
			listElement.parentElement?.classList.toggle('has-more-events', !isOnBottom);
		}
		if(isOnBottom) {
			nextTick().then(() => {
				listElement.lastElementChild?.scrollIntoView({ behavior: 'instant', block: 'end', container: 'nearest' });
			});
		}
		return event;
	}

	function onMysteryDone(m) {
		addEvent('giftedSubs', m.channel, m.gifter, {
			type: 'mystery',
			tier: m.tier,
			count: m.targetCount,
			gifts: m.gifts
		}, m.createdAt);
	}

	loadCheermotes();

	const client = new tmi.Client({
		channels: []
	});
	if(settings.debug_chat_dontConnect !== true) {
		client.connect();
	}
	window.client = client;

	const clientState = reactive({
		connected: false,
		channelsJoined: new Set(),
		channelsToRejoin: [],
	});
	let clientJoinAbortController;

	async function joinChannels(channels) {
		if(!channels) {
			return;
		}
		else if(typeof channels === 'string') {
			channels = [ channels ];
		}
		if(clientJoinAbortController && !clientJoinAbortController.signal.aborted) {
			clientJoinAbortController.abort();
			clientJoinAbortController = null;
		}
		let abortController = new AbortController();
		clientJoinAbortController = abortController;
		for(const n of channels) {
			if(abortController.signal.aborted) {
				break;
			}
			client.join(n);
			await new Promise(r => setTimeout(r, 350));
		}
		if(abortController === clientJoinAbortController) {
			clientJoinAbortController = null;
		}
	}

	let done = false;
	client.on('connect', async () => {
		clientState.connected = true;
		if(done) {
			if(clientState.channelsToRejoin) {
				await joinChannels(clientState.channelsToRejoin);
			}
			return;
		}
		done = true;
		const qs = new URLSearchParams(location.search);
		let channels = [];
		if(qs.has('channel')) {
			channels = [ ...qs.getAll('channel') ];
		}
		else {
			const first = location.href.includes('/fullcpgrid/') ? 1 : 100;
			const qs = new URLSearchParams({ first });
			if(settings.demo_streamLanguage && settings.demo_streamLanguage !== 'none') {
				qs.set('language', settings.demo_streamLanguage);
			}
			const res = await fetch(`https://helix-proxy.alca.tv/streams?${qs}`);
			const json = await res.json();
			channels = json.data.map(n => n.user_login);
		}
		await joinChannels(channels);
	});
	client.on('close', () => {
		clientJoinAbortController?.abort();
		clientJoinAbortController = null;
		clientState.connected = false;
		clientState.channelsToRejoin = [ ...clientState.channelsJoined ];
		clientState.channelsJoined.clear();
	});
	client.on('join', e => {
		clientState.channelsJoined.add(e.channel.login);
		getCheermotes(e.channel.id);
	});
	client.on('part', e => clientState.channelsJoined.delete(e.channel.login));

	client.on('message', e => {
		stats.chatMessages++;
		if(e.cheer) {
			if(e.sharedChat && e.channel.id !== e.sharedChat.channel.id) {
				return;
			}
			addEvent('bits', e.channel, e.user, {
				text: e.message.text,
				emotes: e.message.emotes,
				bits: e.cheer.bits
			});
		}
		else if(e.reward) {
			const rewardType = e.reward.type;
			switch(e.reward.type) {
				case 'gigantifiedEmote': {
					addEvent('bits', e.channel, e.user, {
						text: e.message.text,
						emotes: e.message.emotes,
						rewardType,
						rewardDetail: e.reward.emoteId,
						bits: 0
					});
					break;
				}
				case 'messageEffects': {
					// e.reward.animation: "simmer" | "rainbow-eclipse" | "cosmic-abyss"
					addEvent('bits', e.channel, e.user, {
						text: e.message.text,
						emotes: e.message.emotes,
						rewardType,
						rewardDetail: e.reward.animation,
						bits: 0
					});
					break;
				}
			}
		}
	});

	client.on('raid', e => {
		addEvent('raids', e.channel, e.user, { viewers: e.viewers });
	});

	client.on('sub', e => {
		switch(e.type) {
			case 'sub': {
				addEvent('newSubs', e.channel, e.user, {
					tier: e.plan.tier,
					isPrime: e.plan.isPrime,
					months: e.multiMonth.duration,
				});
				break;
			}
			case 'resub': {
				addEvent('resubs', e.channel, e.user, {
					tier: e.plan.tier, isPrime: e.plan.isPrime,
					cumulativeMonths: e.cumulativeMonths,
					gift: e.gift,
					text: e.message.text, emotes: e.message.emotes
				});
				break;
			}
			case 'subGift': {
				if(e.mystery) {
					const id = e.mystery.id;
					if(mysteryList.has(id)) {
						const mystery = mysteryList.get(id);
						mystery.addGift(e);
					}
					else {
						const mystery = Mystery.fromGift(e);
						mystery.on('done', () => onMysteryDone(mystery));
						mysteryList.set(id, mystery);
					}
				}
				else {
					addEvent('giftedSubs', e.channel, e.user, {
						tier: e.plan.tier,
						cumulativeMonths: e.cumulativeMonths,
						months: e.gift.months,
						recipient: {
							id: e.recipient.id,
							login: e.recipient.login,
							display: e.recipient.display
						},
					});
				}
				break;
			}
			case 'subMysteryGift': {
				const id = e.mystery.id;
				if(mysteryList.has(id)) {
					const mystery = mysteryList.get(id);
					mystery.addMystery(e);
				}
				else {
					const mystery = Mystery.from(e);
					mystery.on('done', () => onMysteryDone(mystery));
					mysteryList.set(id, mystery);
				}
				break;
			}
		}
	});

	function demo(type) {
		const pick = arr => arr[Math.floor(Math.random() * arr.length)];
		const uuid = crypto.randomUUID();
		const channelName = 'alca';
		const channelId = '7676884';
		const badges = 'premium/1';
		const [ userId, userLogin, userDisplay ] = pick([
			[ '7676884', 'alca', 'Alca' ],
			[ '175831187', 'ironmouse', 'ironmouse' ],
			[ '26610234', 'cohhcarnage', 'CohhCarnage' ],
			[ '7236692', 'dansgaming', 'DansGaming' ],
		]);
		const subPlanList = [ 'Prime', 'Prime', 'Prime', '1000', '1000', '1000', '2000', '2000', '3000', '3000' ];
		const color = '#0099ff';
		let irc = '';

		function createMessage() {
			const tokens = [];
			const tokenCount = pick([ 0, 1, 2, 3, 4, 5 ]);
			let offset = 0;
			for(let i = 0; i < tokenCount; i++) {
				if(i % 2) {
					const text = pick([ 'Hello, World!', 'Test', 'Demo' ]);
					tokens.push({ type: 'text', text, start: offset });
					offset += text.length + 1;
				}
				else {
					const { id, text } = pick([
						{ id: 25, text: 'Kappa' },
						{ id: 'emotesv2_5a62d92ba824417c83203459a49fab0e', text: 'dviperYap' },
						{ id: '58127', text: 'CoolCat' },
						{ id: 'emotesv2_f550a9a62b494fe6a6ed905f96b6e3be', text: 'zeldas9Clap' }
					]);
					tokens.push({ type: 'emote', id, text, start: offset });
					offset += text.length + 1;
				}
			}
			const { text, emotes } = tokens.reduce((p, n) => {
				if(n.type === 'emote') {
					const index = [ n.start, n.start + n.text.length ];
					if(p.emotes.has(n.id)) {
						p.emotes.get(n.id).push(index);
					}
					else {
						p.emotes.set(n.id, [ index ]);
					}
				}
				p.text += (p.text ? ' ' : '') + n.text;
				return p;
			}, { text: '', emotes: new Map() });
			return {
				text,
				emotes: [ ...emotes ].reduce((p, [ id, indices ]) => {
					p.push([ id, indices.map(n => n.join('-')) ].join(':'));
					return p;
				}, []).join('/')
			};
		}

		switch(type) {
			case 'bits': {
				// const cheermote = pick([ 'Cheer', 'DoodleCheer', 'cheerwhal', 'Corgo', 'Scoops', 'uni', 'ShowLove', 'Party', 'SeemsGood', 'Pride', 'Kappa', 'FrankerZ', 'HeyGuys', 'DansGame', 'TriHard', 'Kreygasm', '4Head', 'SwiftRage', 'NotLikeThis', 'FailFish', 'VoHiYo', 'PJSalt', 'MrDestructoid', 'bday', 'RIPCheer', 'Shamrock', 'BitBoss', 'Streamlabs', 'Muxy', 'HolidayCheer', 'Goal', 'Charity' ]);
				// const bitsTotal = pick([ 1, 50, 69, 100, 200, 500, 1_000, 1_500, 2_500, 5_000, 10_000, 100_000 ]);
				// const message = createMessage();
				// const text = [
				// 	message.text,
				// 	...pick([
				// 		[ `${cheermote}${bitsTotal}` ],
				// 		bitsTotal % 2 ? [ `${cheermote}${bitsTotal}` ] : [ `${cheermote}${bitsTotal / 2}`, `${cheermote}${bitsTotal / 2}` ]
				// 	])
				// ];
				// irc = `@badge-info=subscriber/8;badges=moderator/1,subscriber/6,turbo/1;bits=${bitsTotal};color=${color};display-name=${userDisplay};emotes=${message.emotes};first-msg=0;flags=;id=${uuid};mod=1;returning-chatter=0;room-id=${channelId};subscriber=1;tmi-sent-ts=${Date.now()};turbo=1;user-id=${userId};user-type=mod :${userLogin}!${userLogin}@${userLogin}.tmi.twitch.tv PRIVMSG #${channelName} :${text.join(' ')}`;
				// const bitsTotal = 1000;
				// const message = { emotes: '' };
				// const text = [ 'A cheer1 B cheer2 cheer3 C cheer4 D' ];
				// irc = `@badge-info=subscriber/8;badges=moderator/1,subscriber/6,turbo/1;bits=${bitsTotal};color=${color};display-name=${userDisplay};emotes=${message.emotes};first-msg=0;flags=;id=${uuid};mod=1;returning-chatter=0;room-id=${channelId};subscriber=1;tmi-sent-ts=${Date.now()};turbo=1;user-id=${userId};user-type=mod :${userLogin}!${userLogin}@${userLogin}.tmi.twitch.tv PRIVMSG #${channelName} :${text.join(' ')}`;
				// irc = `@badge-info=subscriber/99;badges=broadcaster/1,subscriber/3012,the-onryos-mask/1;bits=1;client-nonce=c04f69700bec991e7a6baa005a966196;color=#177DE3;display-name=Alca;emotes=25:5-9,47-51;first-msg=0;flags=;id=834b22a5-e70c-4afc-ab83-0b967a7acda7;mod=0;returning-chatter=0;room-id=7676884;subscriber=1;tmi-sent-ts=1760369496047;turbo=0;user-id=7676884;user-type= :alca!alca@alca.tmi.twitch.tv PRIVMSG #alca :TEST Kappa A cheer1 B cheer2 cheer3 C cheer4 D Kappa DEMO`;
				irc = `@badge-info=subscriber/99;badges=broadcaster/1,subscriber/3012,the-onryos-mask/1;bits=1;client-nonce=c04f69700bec991e7a6baa005a966196;color=#177DE3;display-name=Alca;emotes=25:5-9,47-51;first-msg=0;flags=;id=834b22a5-e70c-4afc-ab83-0b967a7acda7;mod=0;returning-chatter=0;room-id=7676884;subscriber=1;tmi-sent-ts=1760369496047;turbo=0;user-id=7676884;user-type= :alca!alca@alca.tmi.twitch.tv PRIVMSG #alca :TEST Kappa A cheer1 B cheer999 cheer4 DAAAAAAA Kappa DEMO cheer69 cheer1 cheer1 4head1`;
				break;
			}
			case 'raids': {
				const msgId = 'raid';
				const viewerRange = pick([ [ 1, 10 ], [ 8, 25 ], [ 15, 75 ], [ 50, 200 ], [ 150, 750 ], [ 500, 10_000 ] ]);
				const viewerCount = Math.random() * (viewerRange[1] - viewerRange[0]) + viewerRange[0];
				irc = `@badge-info=;badges=${badges};color=${color};display-name=${userDisplay};emotes=;flags=;id=${uuid};login=${userLogin};mod=0;msg-id=${msgId};msg-param-login=${userLogin};msg-param-viewerCount=${viewerCount};room-id=${channelId};subscriber=0;system-msg=;tmi-sent-ts=${Date.now()};user-id=${userId};user-type=;vip=0 :tmi.twitch.tv USERNOTICE #${channelName}`;
				break;
			}
			case 'newSubs': {
				const msgId = 'sub';
				const subPlan = pick(subPlanList);
				irc = `@badge-info=subscriber/1;badges=subscriber/0;color=${color};display-name=${userDisplay};emotes=;flags=;id=${uuid};login=${userLogin};mod=0;msg-id=${msgId};msg-param-cumulative-months=1;msg-param-months=0;msg-param-multimonth-duration=1;msg-param-multimonth-tenure=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=Subscription;msg-param-sub-plan=${subPlan};msg-param-was-gifted=false;room-id=${channelId};subscriber=1;system-msg=;tmi-sent-ts=${Date.now()};user-id=${userId};user-type=;vip=0 :tmi.twitch.tv USERNOTICE #yaritaiji`;
				break;
			}
			case 'resubs': {
				const message = createMessage();
				const msgId = 'resub';
				const months = Math.floor(Math.random() * 119 + 1);
				const subPlan = pick(subPlanList);
				irc = `@badge-info=subscriber/10;badges=subscriber/6,superultracombo-2023/1;color=;display-name=${userDisplay};emotes=${message.emotes};flags=;id=${uuid};login=${userLogin};mod=0;msg-id=${msgId};msg-param-cumulative-months=${months};msg-param-months=0;msg-param-multimonth-duration=1;msg-param-multimonth-tenure=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=Channel\\sSubscription;msg-param-sub-plan=${subPlan};msg-param-was-gifted=false;room-id=${channelId};subscriber=1;system-msg=;tmi-sent-ts=${Date.now()};user-id=${userId};user-type=;vip=0 :tmi.twitch.tv USERNOTICE #${channelName} :${message.text}`;
				break;
			}
		}
		if(irc) {
			demoUuidList.add(uuid);
			if(Array.isArray(irc)) {
				irc.forEach(n => {
					client.onIrcLine(n);
				});
			}
			else {
				client.onIrcLine(irc);
			}
		}
	}
</script>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@100..900&display=swap');
	:root {
		color-scheme: dark;

		--theme-hue: 225;
		--color-username: hsl(var(--theme-hue), 100%, 67%);
		--tw-bits-lvl-1-color: #969696;
		--tw-bits-lvl-100-color: #9c3fe9;
		--tw-bits-lvl-1000-color: #1db4a7;
		--tw-bits-lvl-5000-color: #0099ff;
		--tw-bits-lvl-10000-color: #f42d1f;
		--tw-bits-lvl-100000-color: #f4c91f;
	}
	body {
		font-family: "Roboto Condensed", sans-serif;
		font-optical-sizing: auto;
		font-style: normal;
		font-weight: 400;
		margin: 0;
		background: hsl(var(--theme-hue), 20%, 6%);
		color: #fff;
		overflow: hidden;
	}
	#app {
		display: grid;
		grid-template-rows: 1.5rem auto;
		height: 100vh;
	}
	#head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 4px;

		&-logo {
			flex: 1;
			text-transform: uppercase;
			font-size: 14px;
			font-weight: 700;
		}
		&-stats,
		&-status {
			display: flex;
			font-size: 12px;
			gap: 2px;

			> div {
				display: flex;
				align-items: center;
				gap: 4px;
				padding: 2px 4px;
				border-radius: 3px;
				background: hsl(var(--theme-hue), 36%, 15%);
				border: 1px solid hsl(var(--theme-hue), 30%, 24%);
				user-select: none;
			}
		}
		&-stats {
		}
		&-status {
			> div {
				--status-color: #999;

				&:before {
					content: '';
					display: inline-block;
					width: 6px;
					height: 6px;
					border-radius: 1vh;
					background-color: var(--status-color);
				}
				&[state="good"] {
					--status-color: #2d2;
				}
				&[state="bad"] {
					--status-color: #f00;
				}
			}
		}
		&-buttons {
		}
	}
	#settings {
		display: grid;
		grid-template-rows: min-content 1fr;
		background: hsl(var(--theme-hue), 40%, 10%);
		border: 2px solid hsl(var(--theme-hue), 50%, 20%);
		box-shadow: 0 4px 12px 8px hsl(var(--theme-hue), 20%, 4%, 0.85);

		width: calc(100vw - 40px);
		max-width: 80vw;
		min-width: 540px;

		height: calc(100vh - 40px);
		max-height: 65vh;
		min-height: 360px;
		border-radius: 8px;
		overflow: hidden;
		position: fixed;
		top: 50%;
		left: 50%;
		z-index: 1000;
		translate: -50% -50%;
		transition: 200ms transform ease-out, 80ms opacity linear;

		&[showing="false"] {
			pointer-events: none;
			transform: perspective(600px) translate3d(0, 100px, -50px);
			opacity: 0;
			transition: 100ms transform ease-in, 100ms opacity linear;
		}
		#settings-head,
		#settings-body {
		}
		#settings-head {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			align-items: center;
			justify-items: center;
			gap: 8px;
			background: hsl(var(--theme-hue), 50%, 14%);
			border-bottom: 2px solid hsl(var(--theme-hue), 50%, 20%);

			> :first-child {
				justify-self: flex-start;
			}
			> :last-child {
				justify-self: flex-end;
			}
			#settings-head-text,
			#settings-head-buttons {
				padding: 8px;
			}
			#settings-head-text {
				font-weight: 700;
				align-text: center;
			}
			#settings-head-search {
				display: flex;
				gap: 4px;
				align-items: center;
			}
			#settings-head-buttons {
				display: flex;
				gap: 4px;
			}
		}
		#settings-body {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
			padding: 6px;
			overflow-y: scroll;
			scrollbar-width: thin;
			scrollbar-color: hsl(var(--theme-hue), 20%, 30%) hsla(var(--theme-hue), 20%, 30%, 0.2);

			hr {
				margin: 1rem 0;
				width: 99%;
				align-self: center;
			}
			h1, h2 {
				margin: 0;
			}
			h1 {
				font-size: 1.75rem;
			}
			h2 {
				font-size: 1.25rem;
			}
			label,
			.flex {
				display: flex;
				gap: 6px;
			}
			label {
				cursor: pointer;
			}
			input[type="checkbox"]:has(+ .icon) {
				display: none;

				+ .icon:not([icon]) {
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='M19 5v14H5V5zm0-2H5a2 2 0 0 0-2 2v14q.2 1.8 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2'/%3E%3C/svg%3E");
				}
				&:checked + .icon:not([icon]) {
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5a2 2 0 0 0-2 2v14q.2 1.8 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-9 14-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8z'/%3E%3C/svg%3E");
				}
			}
			.picker-container {
				display: inline-block;
				padding: 0.5rem;
			}
			.picker-big,
			.picker-small {
				--picker-pos: 0%;
				height: 1rem;
				border-radius: 0.5rem;
				position: relative;
				user-select: none;
				pointer-events: none;

				&:before {
					content: '';
					display: block;
					position: absolute;
					top: -0.25rem;
					left: var(--picker-pos);
					bottom: -0.25rem;
					width: 1px;
					background: #fff;
					border-left: 1px solid #000;
					pointer-events: none;
				}
			}
			.picker-big {
				width: 25rem;
				background: linear-gradient(90deg, #f00, #ff0 16.6666%, #0f0 33.3333%, #0ff 50%, #00f 66.6666%, #f0f 83.3333%, #f00);
			}
			.picker-small {
				width: 10rem;
			}
			.setting-desc {
				display: flex;
				flex-direction: column;
				padding: 6px;
				gap: 4px;

				&:empty {
					display: none;
				}
				&[type="sub"] {
					padding: 0;
				}
			}
			.setting-desc__name {
				.setting-desc__reset {
					display: inline-block;
					vertical-align: center;
				}
			}
			.setting-desc__reset {
				width: 18px;
				height: 18px;
				background-repeat: no-repeat;
				background-size: contain;
				background-position: center;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ddd'%3E%3Cpath d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8'/%3E%3C/svg%3E");
				cursor: pointer;
				opacity: 1;
				transition: opacity 500ms;

				&:not([is-default="true"]):hover {
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23fff'%3E%3Cpath d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8'/%3E%3C/svg%3E");
				}
				&[is-default="true"] {
					cursor: default;
					opacity: 0.2;
					transition: opacity 50ms;
				}
			}
			.setting-desc__description {
				font-size: 0.875em;
				color: #ccc;
				border-left: 2px solid hsl(var(--theme-hue), 50%, 30%);
				padding-left: 6px;
			}
		}
	}
	#events {
		display: grid;
		// grid-auto-rows: 1fr;
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
		// height: 100vh;
	}
	.event-container-row {
		display: grid;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
	}
	.event-container {
		display: flex;
		flex-direction: column;
		border: 1px solid hsl(0, 0%, 0%);
		box-sizing: border-box;
		height: 0;
		min-height: 100%;
		position: relative;
		overflow: hidden;

		.more-events {
			position: absolute;
			bottom: -4px;
			left: 50%;
			translate: -50% calc(100% + 4px);
			pointer-events: none;
			cursor: default;
			background: hsl(var(--theme-hue), 70%, 15%);
			border: 2px solid hsl(var(--theme-hue), 45%, 40%);
			opacity: 0.8;
			padding: 4px 10px;
			border-radius: 6px;
			transition: translate 275ms ease-in-out;

			&:hover {
				opacity: 0.97;
			}
			&:before {
				content: 'More';
				text-transform: uppercase;
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0.04em;
			}
		}
		&.has-more-events {
			.more-events {
				translate: -50% 0%;
				pointer-events: unset;
				cursor: pointer;
				transition: translate 80ms ease-in-out;
			}
		}
	}
	.event-title {
		display: flex;
		gap: 4px;
		align-items: center;
		background: hsl(var(--theme-hue), 22%, 10%);

		&-text {
			flex-grow: 1;
			font-weight: 700;
			text-align: center;
			color: #ccc;
		}
		.event-badge {
			font-size: 0.75em;
			padding: 2px 4px;
			border-radius: 3px;
			background: hsl(var(--theme-hue), 36%, 15%);
			border: 1px solid hsl(var(--theme-hue), 30%, 24%);
		}
	}
	.event-items {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: scroll;
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--theme-hue), 20%, 30%) hsla(var(--theme-hue), 20%, 30%, 0.2);
	}
	.event-item {
		flex-shrink: 0;
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 2px 4px;
		overflow: hidden;

		& + .event-item {
			border-top: 1px solid hsl(0, 0%, 20%);
		}
		.event-item-meta,
		.details-head {
			display: flex;
			align-items: center;
		}
		.event-item-meta {
			gap: 3px;

			.timestamp {
				color: #ccc;
			}
		}
		.event-item-data {
			color: #ddd;
		}
		&.details {
			flex-direction: column;
			align-items: unset;
			gap: 0;

			.event-item-data {
				flex: 1;
				color: #ddd;

				label {
					display: flex;
					gap: 4px;
					cursor: pointer;
				}
				input {
					display: none;
				}
			}
			.summary-marker {
				--angle: 0deg;
				flex: 1;
				text-align: right;

				&:before {
					content: '';
					display: inline-block;
					width: 18px;
					height: 18px;
					background-repeat: no-repeat;
					background-size: contain;
					background-position: center center;
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ccc'%3E%3Cpath d='m8.6 16.6 4.6-4.6-4.6-4.6L10 6l6 6-6 6z'/%3E%3C/svg%3E");
					transition: rotate 100ms ease-in-out;
					rotate: var(--angle);
				}
			}
			.details-head {
				gap: 6px;
			}
			.details-body {
				display: none;
				grid-template-columns: repeat(auto-fit, minmax(20ch, 1fr));
				gap: 2px 6px;
				border-left: 3px solid hsl(var(--theme-hue), 54%, 36%);
				box-shadow: -2px 0 1px -1px hsl(var(--theme-hue), 64%, 57%);
				// padding-left: 4px;
				background: hsl(var(--theme-hue), 22%, 10%);
				padding: 6px 4px;
			}
			&:has(.event-item-data input:checked) {
				.summary-marker {
					--angle: 90deg;

					&:before {

					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23fff'%3E%3Cpath d='m8.6 16.6 4.6-4.6-4.6-4.6L10 6l6 6-6 6z'/%3E%3C/svg%3E");
					}
				}
				.details-body {
					display: grid;
				}
			}
		}
		.timestamp,
		.badge {
			font-variant-numeric: tabular-nums;
		}
		.timestamp {}
		.badge {
			--badge-color-background: hsl(var(--theme-hue), 55%, 28%);
			--badge-color-border: hsl(var(--theme-hue), 50%, 38%);
			--badge-color-background-highlight: hsl(calc(var(--theme-hue) - 40), 100%, 25%);
			--badge-color-border-highlight: hsl(calc(var(--theme-hue) - 40), 100%, 38%);
			display: inline-block;
			padding: 1px 3px;
			background: var(--badge-color-background);
			border: 1px solid var(--badge-color-border);
			border-radius: 3px;
			font-weight: 400;

			&.badge-mystery {
				--sub-color: var(--badge-color-background);
				--badge-color-background-highlight: var(--sub-color);
				--badge-color-border-highlight: var(--sub-color);
				display: flex;
				align-items: center;
				background: color-mix(in oklch, #000, var(--badge-color-background-highlight) 55%);
				border-color: color-mix(in oklch, #000, var(--badge-color-border-highlight) 90%);

				&:before {
					content: '🎲';
					font-size: 0.625em;
					margin-right: 0.25em;
				}
				&:not([level]),
				&[level="0"] {
					background: var(--badge-color-background-highlight);
					border-color: var(--badge-color-border-highlight);
				}
				&[level="1"] {
					--sub-color: color-mix(in srgb, black 15%, var(--tw-bits-lvl-1-color));
				}
				&[level="2"] {
					--sub-color: var(--tw-bits-lvl-100-color);
				}
				&[level="3"] {
					--sub-color: var(--tw-bits-lvl-1000-color);
				}
				&[level="4"] {
					--sub-color: var(--tw-bits-lvl-5000-color);
				}
				&[level="5"] {
					--sub-color: var(--tw-bits-lvl-10000-color);
				}
				&[level="6"] {
					--sub-color: var(--tw-bits-lvl-100000-color);
				}
			}
			&.badge-tier {
				&:is([level="2"], [level="3"]) {
					background: var(--badge-color-background-highlight);
					border-color: var(--badge-color-border-highlight);
				}
			}
			&.badge-months {
				min-width: 4ch;
				text-align: right;

				&.badge-months:is([highlighted="true"]) {
					background: color-mix(in hsl, var(--badge-color-background) 60%, var(--badge-color-background-highlight));
					border-color: color-mix(in hsl, var(--badge-color-border) 30%, var(--badge-color-border-highlight));
				}
				&.badge-months-minimal {
					min-width: unset;
				}
			}
			&.badge-gift,
			&.badge-bits-reward,
			&.badge-bits {
				display: flex;
				gap: 4px;
				align-items: baseline;

				&:before {
					content: '';
					align-self: center;
					display: inline;
					width: 14px;
					height: 14px;
					background-image: var(--badge-image);
					background-repeat: no-repeat;
					background-size: contain;
				}
				span {
					min-width: 4ch;
					text-align: right;
				}
			}
			&.badge-gift,
			&.badge-bits-reward {
				&:before {
					width: 16px;
					height: 16px;
					margin-right: -2px;
				}
			}
			&.badge-gift {
				--badge-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' aria-hidden='true'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M16 6h2v6h-1v6H3v-6H2V6h2V4.8a2.81 2.81 0 0 1 5.16-1.57L10 4.5l.85-1.27a3 3 0 0 1 .35-.43 2.81 2.81 0 0 1 4.8 2zM6 4.8V6h2.6L7.49 4.34A.81.81 0 0 0 6 4.8m8 0V6h-2.6l1.11-1.66A.81.81 0 0 1 14 4.8zM16 8v2h-5V8zm-1 8v-4h-4v4zM9 8v2H4V8zm0 4H5v4h4z' clip-rule='evenodd'/%3E%3C/svg%3E");
			}
			&.badge-bits-reward {
				&[type="gigantifiedEmote"] {
					--badge-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='2.5 2.5 15 15'%3E%3Cpath d='M10 14a4 4 0 0 0 3.86-3H6.14A4 4 0 0 0 10 14'/%3E%3Cpath d='m10 2.5a7 7 0 100 15 7 7 0 000-15m-.01 13.5a6 6 0 11.03-12 6 6 0 01-.03 12'/%3E%3Ccircle cx='13' cy='8' r='1'/%3E%3Ccircle cx='7' cy='8' r='1'/%3E%3C/svg%3E");
				}
				&[type="messageEffects"] {
					--badge-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25zM11.5 9.5 9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zm-1.51 3.49L9 15.17l-.99-2.18L5.83 12l2.18-.99L9 8.83l.99 2.18 2.18.99z'/%3E%3C/svg%3E");
				}
			}
			&.badge-bits {
				--bits-color: var(--tw-bits-lvl-1-color);
				--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/1/1.png');
				// background-image: linear-gradient(to right, var(--bits-color), transparent);
				box-shadow: 40px 0px 30px -30px var(--bits-color) inset;

				&:before {
					filter: drop-shadow(0px 0px 3px black) drop-shadow(0px 0px 2px black);
				}
				&[level="1"] {
					--bits-color: var(--tw-bits-lvl-1-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/1/1.png');
				}
				&[level="100"] {
					--bits-color: var(--tw-bits-lvl-100-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/100/1.png');
				}
				&[level="1000"] {
					--bits-color: var(--tw-bits-lvl-1000-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/1000/1.png');
				}
				&[level="5000"] {
					--bits-color: var(--tw-bits-lvl-5000-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/5000/1.png');
				}
				&[level="10000"] {
					--bits-color: var(--tw-bits-lvl-10000-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/10000/1.png');
				}
				&[level="100000"] {
					--bits-color: var(--tw-bits-lvl-100000-color);
					--badge-image: url('https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/static/100000/1.png');
				}
			}
		}
		.username {
			font-weight: 600;
			display: inline;
			word-break: break-word;
			line-break: anywhere;
		}
		.message {
			display: inline;
		}
	}
	#big-emote {
		display: none;
		place-items: center;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 100;

		#big-emote-scrim {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: hsl(0, 0%, 0%, 0.5);
			cursor: pointer;
		}

		&[show="true"] {
			display: grid;
		}
		& > div {
			cursor: default;
		}
		#big-emote-container {
			display: flex;
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
			background: hsl(var(--theme-hue), 36%, 15%);
			padding: 1rem;
			border-radius: 0.25rem;
			border: 2px solid hsl(var(--theme-hue), 30%, 24%);
			position: relative;

			#big-emote-close {
				position: absolute;
				top: 0;
				right: 0;
				transform: translate(50%, -50%);
				width: 18px;
				height: 18px;
				padding: 6px;
				border-radius: 100vh;
				outline: 2px solid hsl(var(--theme-hue), 30%, 24%);
				background-color: hsl(var(--theme-hue), 36%, 15%);
				background-size: 18px;
				background-repeat: no-repeat;
				background-position: center;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ccc'%3E%3Cpath d='M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z'/%3E%3C/svg%3E");
				cursor: pointer;
				outline-offset: -2px;
				transition: outline-offset 100ms ease-in-out;

				&:hover {
					outline-offset: 0px;
				}
			}
			#big-emote-name {
				text-align: center;
			}
			#big-emote-image {
				align-self: center;
				width: 112px;
				height: auto !important;
				max-height: calc(-139px + 100vh);
				max-width: calc(-76px + 100vw);
				min-height: 28px;
				min-width: 28px;
				aspect-ratio: 1;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-origin: content-box;
				resize: both;
				overflow: auto;
				user-select: none;
				padding-bottom: 1rem;
			}
			#big-emote-buttons {
				display: flex;
				gap: 4px;
				align-items: center;
				justify-content: flex-end;
			}
		}
	}
	.button {
		cursor: pointer;

		&:has(> .icon[icon="settings"]) {
			transition: rotate 150ms ease-in-out;

			&:hover {
				rotate: -22.5deg;
				transition: rotate 225ms ease-in-out;
			}
		}
	}
	.icon {
		width: 18px;
		height: 18px;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center;

		&[icon="fold_all"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ccc'%3E%3Cpath d='M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10z'/%3E%3C/svg%3E");
		}
		&[icon="unfold_all"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ccc'%3E%3Cpath d='M12 5.83 15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15z'/%3E%3C/svg%3E");
		}
		&[icon="close"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='%23ccc'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E");
		}
		&[icon="settings"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='M19.14 12.94a7 7 0 0 0-.01-1.88l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96q-.74-.57-1.62-.94l-.36-2.54a.5.5 0 0 0-.48-.41h-3.84a.5.5 0 0 0-.47.41l-.36 2.54q-.88.37-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58a6 6 0 0 0-.02 1.88l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96q.74.57 1.62.94l.36 2.54a.5.5 0 0 0 .48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7 7 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6'/%3E%3C/svg%3E");
		}
		&[icon="unchecked"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ddd' viewBox='0 0 24 24'%3E%3Cpath d='M19 5v14H5V5zm0-2H5a2 2 0 0 0-2 2v14q.2 1.8 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2'/%3E%3C/svg%3E");
		}
		&[icon="checked"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ddd' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5a2 2 0 0 0-2 2v14q.2 1.8 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-9 14-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8z'/%3E%3C/svg%3E");
		}
		&[icon="open_external"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14q.2 1.8 2 2h14a2 2 0 0 0 2-2v-7h-2zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3z'/%3E%3C/svg%3E");
		}
		&[icon="reset"] {
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ccc'%3E%3Cpath d='M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8'/%3E%3C/svg%3E");
		}
	}
	.username {
		color: #fff;
	}
	[theme_colorizeNames="true"] {
		.username {
			color: var(--color-username);
		}
	}
</style>