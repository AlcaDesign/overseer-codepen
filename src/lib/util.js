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
