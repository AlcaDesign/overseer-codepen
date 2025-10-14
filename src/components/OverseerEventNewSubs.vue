<template lang="pug">
.event-item(v-if="e")
	.event-item-meta
		OverseerTimestamp(:date="e.timestamp")
		.badge.badge-tier(
			:level="e.data.tier"
			:title="getBadgeSubTierTitle(e.data)"
		) {{ getBadgeSubTier(e.data) }}
	.event-item-data(
		:title="`Event in [${e.channel.id}] ${e.channel.login}`"
	)
		.username {{ formatUsername(e.user) }}
		template(v-if="e.data.months > 1")
			| {{ ' ' }}
			.badge {{ n(e.data.months) }}
			=' months in advance'
</template>

<script setup>
	import { formatUsername, getBadgeSubTier, getBadgeSubTierTitle, n } from 'https://codepen.io/Alca/pen/GgoMOOG.js';
	import OverseerTimestamp from 'https://codepen.io/Alca/pen/RNrVBxO.js';
	
	const props = defineProps({
		e: {
			type: Object,
			required: true
		},
	});
</script>

<style lang="scss">
</style>
