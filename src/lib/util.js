export const STORAGE_KEYS = {
	settings: 'overseer-settings',
	cheermoteBroadcaster: 'overseer-cheermote-broadcasters',
};
export const cheermotesCache = new Map();
export const cheermotesDefault = new Map([ 'Cheer', 'DoodleCheer', 'cheerwhal', 'Corgo', 'Scoops',
	'uni', 'ShowLove', 'Party', 'SeemsGood', 'Pride', 'Kappa', 'FrankerZ', 'HeyGuys',
	'DansGame', 'TriHard', 'Kreygasm', '4Head', 'SwiftRage', 'NotLikeThis', 'FailFish',
	'VoHiYo', 'PJSalt', 'MrDestructoid', 'bday', 'RIPCheer', 'Shamrock', 'BitBoss',
	'Streamlabs', 'Muxy', 'HolidayCheer', 'Goal', 'Anon', 'Charity'
].map(prefix => {
	const levels = [ 'Cheer', 'DoodleCheer' ].includes(prefix)
		? [ 1, 100, 1_000, 5_000, 10_000, 100_000 ]
		: [ 1, 100, 1_000, 5_000, 10_000 ];
	return [
		prefix.toLowerCase(),
		levels.map(level => [
			`https://d3aqoihi2n8ty8.cloudfront.net/actions/${prefix.toLowerCase()}/dark/static/${level}/1.png`,
			`https://d3aqoihi2n8ty8.cloudfront.net/actions/${prefix.toLowerCase()}/dark/animated/${level}/1.gif`,
		])
	];
}));

export function formatUsername(user) {
	const display = user.display || user.login || '';
	if(user.login && display.toLowerCase().replaceAll(/\s/g, '') !== user.login) {
		return `${display} (${user.login})`;
	}
	return user.display || user.login || '(unknown)';
}
export function getBadgeSubTier(data) {
	return data.isPrime ? 'P' : `${data.tier}`;
}
export function getBadgeSubTierTitle(data) {
	return data.isPrime ? `Prime (Tier 1)` : `Tier ${data.tier}`;
}
export function s(value, word = '', pluralForm = '') {
	return value === 1 ? word : pluralForm ? pluralForm : `${word}s`;
}
export function n(value) {
	return value.toLocaleString();
}
export function fmt(value, word = '', pluralForm = '') {
	return `${value.toLocaleString()} ${s(value, word, pluralForm)}`;
}
export function getBadgeSubIsHighlighted(data) {
	const value = typeof data === 'number' ? data : data.cumulativeMonths;
	return value % 12 === 0 || value === 1;
}
export function getBadgeSubMonths(data) {
	return `${n(data.cumulativeMonths)}m`;
}
export function getBadgeSubMonthsTitle(data) {
	const months = typeof data === 'number' ? data : data.cumulativeMonths;
	const years = Math.floor(months / 12);
	const monthsRemainder = months % 12;

	const monthsFormatted = fmt(months, 'month');
	const yearsFormatted = fmt(years, 'year');
	const monthsRemainderFormatted = fmt(monthsRemainder, 'month');

	if(monthsRemainder === 0) {
		return `${monthsFormatted} (${yearsFormatted})`;
	}
	else if(years === 0) {
		return `${monthsFormatted}`;
	}
	return `${monthsFormatted} (${yearsFormatted} ${monthsRemainderFormatted})`;
}
export function getBadgeBitsLevel(data) {
	const bits = typeof data === 'number' ? data : data.bits;
	if(bits >= 100_000) { return 100_000; }
	if(bits >=  10_000) { return  10_000; }
	if(bits >=   5_000) { return   5_000; }
	if(bits >=   1_000) { return   1_000; }
	if(bits >=     100) { return     100; }
	return 1;
}
export function getBadgeBitsReward(data) {
	const isGE = data.rewardType === 'gigantifiedEmote';
	if(isGE && settings.bits_rewardCost_gigantifiedEmote) {
		return settings.bits_rewardCost_gigantifiedEmote;
	}
	else if(!isGE && settings.bits_rewardCost_messageEffects) {
		return settings.bits_rewardCost_messageEffects;
	}
	return isGE ? 'GE' : 'ME';
}
export function getBadgeBitsRewardTitle(data) {
	return data.rewardType === 'gigantifiedEmote'
		? 'Gigantified Emote'
	: `Message Effect (${data.rewardDetail})`;
}
export function loadCheermotes() {
	const json = localStorage.getItem(STORAGE_KEYS.cheermoteBroadcaster);
	if(!json) {
		return;
	}
	const data = JSON.parse(json);
	data.forEach(([ channelId, channelPrefix, cheermoteId ]) => {
		if(!channelPrefix) {
			cheermotesCache.set(channelId, cheermotesDefault);
			return;
		}
		const baseUrl = `https://d3aqoihi2n8ty8.cloudfront.net/partner-actions/${cheermoteId}`;
		const channelCheermotes = [ 1, 100, 1_000, 5_000, 10_000 ].map(level => [ `${baseUrl}/${level}/dark/static/1.png`, `${baseUrl}/${level}/dark/animated/1.gif` ]);
		const map = new Map(function*() { yield [ channelPrefix, channelCheermotes ]; yield* cheermotesDefault; }());
		cheermotesCache.set(channelId, map);
	});
}
export function saveCheermotes() {
	const data = [ ...cheermotesCache.entries().map(([ channelId, channelCheermotes ]) => {
		const diff = new Set(channelCheermotes.keys()).difference(new Set(cheermotesDefault.keys()));
		const channelPrefix = diff.values().next().value;
		const cheermote = channelPrefix ? channelCheermotes.get(channelPrefix) : [];
		if(!cheermote.length) {
			return [ channelId, '', '' ];
		}
		const first = cheermote[0][0];
		const match = first.match(/^https:\/\/d3aqoihi2n8ty8\.cloudfront\.net\/partner-actions\/([^\/]+\/[^\/]+)\/\d+\/dark\/(?:static|animated)\/1.(?:png|gif)$/i);
		const cheermoteId = match ? match[1] : '';
		return [ channelId, channelPrefix, cheermoteId ];
	}) ];
	localStorage.setItem(STORAGE_KEYS.cheermoteBroadcaster, JSON.stringify(data));
}
export async function getCheermotes(broadcasterId) {
	const existing = cheermotesCache.get(broadcasterId);
	if(existing) {
		return existing;
	}
	const qs = new URLSearchParams({ broadcaster_id: broadcasterId });
	const url = `https://helix-proxy.alca.tv/bits/cheermotes?${qs}`;
	const res = await fetch(url);
	if(!res.ok) {
		return cheermotesDefault;
	}
	const json = await res.json();
	const data = new Map(json.data.map(n => [
		n.prefix.toLowerCase(),
		n.tiers.map(n => [ n.images.dark.static[1], n.images.dark.animated[1] ])
	]));
	cheermotesCache.set(broadcasterId, data);
	saveCheermotes();
	return data;
}
export function getCheermotesCached(broadcasterId) {
	const existing = cheermotesCache.get(broadcasterId);
	if(existing) {
		return existing;
	}
	getCheermotes(broadcasterId).catch(console.error);
	return cheermotesDefault;
}
