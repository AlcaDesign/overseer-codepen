<template lang="pug">
.event-item(v-if="e")
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
	import { formatUsername, fmt, n } from 'https://codepen.io/Alca/pen/GgoMOOG.js';
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
