<template lang="pug">
.event-item(v-if="show")
	.event-item-meta
		OverseerTimestamp(:date="e.timestamp")
		.badge(
			:title="fmt(e.data.viewers, 'viewer')"
		) {{ n(e.data.viewers) }}
	.event-item-data(
		:title="`Event in [${e.channel.id}] ${e.channel.login}`"
	)
		.username {{ formatUsername(e.user) }}
</template>

<script setup>
	import { computed } from 'vue';
	import { formatUsername, fmt, n } from 'https://codepen.io/Alca/pen/GgoMOOG.js';
	import OverseerTimestamp from 'https://codepen.io/Alca/pen/RNrVBxO.js';

	const { e, settings } = defineProps({
		e: {
			type: Object,
			required: true
		},
		settings: {
			type: Object,
		},
	});

	computed(() => {
		if(!e || !settings) {
			return false;
		}
		else if(settings.raids_minimumViewers <= 1) {
			return true;
		}
		return e.data.viewers >= settings.raids_minimumViewers;
	});
</script>

<style lang="scss">
</style>