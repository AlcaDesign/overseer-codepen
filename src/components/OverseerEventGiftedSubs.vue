<template lang="pug">
.event-item(
	v-if="e"
	:class="{ details: e.data.type === 'mystery' && (e.data.count > 1 || settings.giftSubs_mysterySingle === false) }"
)
	template(v-if="e.data.type === 'mystery' && e.data.count === 1 && settings.giftSubs_mysterySingle !== false")
		.event-item-meta
			OverseerTimestamp(v-if="e.timestamp" :date="e.timestamp")
			.badge(
				:level="e.data.tier"
				:title="getBadgeSubTierTitle(e.data)"
			) {{ getBadgeSubTier(e.data) }}
			.badge.badge-mystery(title="1 gift") 1
		.event-item-data(
			:title="`Event in [${e.channel.id}] ${e.channel.login}`"
		)
			.username {{ formatUsername(e.user) }}
			=' gifted '
			.badge.badge-months.badge-months-minimal(
				:highlighted="getBadgeSubIsHighlighted(e.data.gifts[0])"
				:title="getBadgeSubMonthsTitle(e.data.gifts[0])"
			) {{ getBadgeSubMonths(e.data.gifts[0]) }}
			=' '
			.username {{ formatUsername(e.data.gifts[0].user) }}
	template(v-else-if="e.data.type === 'mystery'")
		.details-head
			.event-item-meta
				OverseerTimestamp(v-if="e.timestamp" :date="e.timestamp")
				.badge(
					:level="e.data.tier"
					:title="getBadgeSubTierTitle(e.data)"
				) {{ getBadgeSubTier(e.data) }}
				.badge.badge-mystery(
					:level="badgeGiftLevel"
					:title="fmt(e.data.count, 'gift')"
				) {{ e.data.count }}
			.event-item-data(
				:title="`Event in [${e.channel.id}] ${e.channel.login}`"
			)
				label
					input(
						type="checkbox"
						:checked="getGiftDetailsCheckbox()"
						@change="setGiftDetailsCheckbox($event.target.checked)"
					)
					span
						.username {{ formatUsername(e.user) }}
						=' '
						| gifted {{ fmt(e.data.count, 'sub') }}
					.summary-marker
		.details-body(v-if="e.data.gifts.length")
			.gift(v-for="g in e.data.gifts" :key="g.user.id")
				.badge.badge-months.badge-months-minimal(
					:highlighted="getBadgeSubIsHighlighted(g)"
					:title="getBadgeSubMonthsTitle(g)"
				) {{ getBadgeSubMonths(g) }}
				=' '
				.username {{ formatUsername(g.user) }}
	template(v-else="")
		.event-item-meta
			OverseerTimestamp(v-if="e.timestamp" :date="e.timestamp")
			.badge(
				:level="e.data.tier"
				:title="getBadgeSubTierTitle(e.data)"
			) {{ getBadgeSubTier(e.data) }}
		.event-item-data(
			:title="`Event in [${e.channel.id}] ${e.channel.login}`"
		)
			.username {{ formatUsername(e.user) }}
			=' gifted '
			| {{ e.data.months > 1 ? `${fmt(e.data.months, 'month')} to ` : '' }}
			.badge.badge-months.badge-months-minimal(
				:highlighted="getBadgeSubIsHighlighted(e.data)"
				:title="getBadgeSubMonthsTitle(e.data)"
			) {{ getBadgeSubMonths(e.data) }}
			=' '
			.username {{ formatUsername(e.data.recipient) }}
</template>

<script setup>
	import { computed } from 'vue';
	import { fmt, n, formatUsername, getBadgeSubTier, getBadgeSubTierTitle, getBadgeSubIsHighlighted, getBadgeSubMonths, getBadgeSubMonthsTitle } from 'https://codepen.io/Alca/pen/GgoMOOG.js';
	import OverseerTimestamp from 'https://codepen.io/Alca/pen/RNrVBxO.js';

	const { settings, e, giftedSubsDetailsCheckboxMap } = defineProps({
		settings: {
			type: Object,
			required: true,
		},
		e: {
			type: Object,
			required: true
		},
		giftedSubsDetailsCheckboxMap: {
			type: Object,
			required: true
		}
	});

	const badgeGiftLevel = computed(() => {
		const count = typeof e.data === 'number' ? e.data : e.data.count;
		if(count >= 200) { return 6; }
		if(count >= 100) { return 5; }
		if(count >= 50) { return 4; }
		if(count >= 20) { return 3; }
		if(count >= 10) { return 2; }
		if(count >= 5) { return 1; }
		return 0;
	});

	function getGiftDetailsCheckbox() {
		const eventId = e.eventId;
		if(giftedSubsDetailsCheckboxMap.has(eventId)) {
			return giftedSubsDetailsCheckboxMap.get(eventId);
		}
		let newState = settings.giftSubs_autoExpand;
		if(newState && settings.giftSubs_expandThresholdToggle && e.data.count > settings.giftSubs_expandThreshold) {
			return false;
		}
		giftedSubsDetailsCheckboxMap.set(eventId, newState);
		return newState;
	}
	function setGiftDetailsCheckbox(newState) {
		const eventId = e.eventId;
		giftedSubsDetailsCheckboxMap.set(eventId, newState);
	}
</script>

<style lang="scss">
</style>