export function formatUsername(user) {
	const display = user.display || user.login || '';
	if(user.login && display.toLowerCase().replaceAll(/\s/g, '') !== user.login) {
		return `${display} (${user.login})`;
	}
	return display || '(unknown)';
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
