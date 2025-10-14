<template lang="pug">
.timestamp(:title="title") {{ time }}
</template>

<script setup>
	import { ref, computed, watchEffect } from 'vue';
	const props = defineProps({
		date: { type: [ Number, null ], default() { return Date.now(); } }
	});
	const date = computed(() => new Date(props.date));
	const title = computed(() => date.value.toLocaleString());
	const time = ref('');
	const timeout = ref(null);
	update();
	defineExpose({ time, timeout });
	watchEffect(() => {
		if(props.date) {
			setTimer();
		}
		else {
			clearTimeout(timeout.value);
		}
	});
	function setTimer(now = Date.now()) {
		clearTimeout(timeout.value);
		const timeValue = date.value.getTime();
		let diffMs = now - timeValue;
		if(diffMs !== diffMs) {
			console.warn('[OverseerTimestamp] Cannot create timer because of an invalid date prop', { cause: { props } });
			return;
		}
		if(diffMs < 0) {
			diffMs = Math.abs(diffMs);
		}
		if(diffMs > 86400_000) {
			return;
		}
		// Update exactly when the next second/minute/hour/day starts
		let delay = 1000;
		if(diffMs < 60_000) { // Less than a minute
			delay = 1000 - (diffMs % 1000);
		}
		else if(diffMs < 3_600_000) { // Less than an hour
			delay = 60_000 - (diffMs % 60_000);
		}
		else if(diffMs < 86_400_000) { // Less than a day
			delay = 3_600_000 - (diffMs % 3_600_000);
		}
		else { // More than a day
			delay = 86_400_000 - (diffMs % 86_400_000);
		}
		timeout.value = setTimeout(() => {
			update();
			setTimer();
		}, delay);
	}
	function update(now = Date.now()) {
		if(props.date) {
			let diff = (now - date.value.getTime()) * 0.001;
			if(diff < 0) {
				diff = Math.abs(diff);
			}
			if(diff < 1) {
				time.value = '0s';
			}
			else if(diff < 60) { // Less than a minute
				time.value = `${Math.floor(diff)}s`;
			}
			else if(diff < 3600) { // Less than an hour
				time.value = `${Math.floor(diff / 60)}m`;
			}
			else if(diff < 86400) { // Less than a day
				time.value = `${Math.floor(diff / 3600)}h`;
			}
			else if(diff < 604800) { // Less than a week
				time.value = `${Math.floor(diff / 86400)}d`;
			}
			else if(diff < 31557600) { // Less than a year (365.25 days)
				time.value = `${Math.floor(diff / 604800)}w`;
			}
			else {
				time.value = `${Math.floor(diff / 31557600)}y`;
			}
		}
		else {
			time.value = '--';
		}
	}
</script>

<style lang="scss">
	.timestamp {
		// font-family: var(--font-mono, monospace);
		// font-size: var(--font-mono-size, 16px);
		min-width: 4ch;
		text-align: right;
	}
</style>
