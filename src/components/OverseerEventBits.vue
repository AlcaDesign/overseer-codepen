<template lang="pug">
.event-item(v-if="e")
	.event-item-meta
		OverseerTimestamp(:date="e.timestamp")
		.badge.badge-bits(
			v-if="e.data.bits > 0"
			:level="getBadgeBitsLevel(e.data)"
			:title="fmt(e.data.bits, 'bit')"
		)
			span {{ n(e.data.bits) }}
		.badge.badge-bits-reward(
			v-else=""
			:type="e.data.rewardType"
			:title="getBadgeBitsRewardTitle(e.data)"
		)
			span {{ getBadgeBitsReward(e.data) }}
	.event-item-data(
		:title="`Event in [${e.channel.id}] ${e.channel.login}`"
	)
		.username {{ formatUsername(e.user) }}
		=' '
		OverseerMessage(
			:text="e.data.text"
			:emotes="e.data.emotes"
			:isCheer="true"
			:rewardType="e.data.rewardType"
			:rewardDetail="e.data.rewardDetail"
			@clickEmote="(...args) => $emit('clickEmote', ...args)"
			:cheermotes="getCheermotesCached(e.channel.id)"
			:combineCheermotes="settings.bits_combineCheermotes"
			:debugLog="settings.debug_message_doLog"
		)
</template>

<script setup>
	import { fmt, n, formatUsername, getCheermotesCached, getBadgeBitsLevel, getBadgeBitsReward, getBadgeBitsRewardTitle } from 'https://codepen.io/Alca/pen/GgoMOOG.js';
	import OverseerTimestamp from 'https://codepen.io/Alca/pen/RNrVBxO.js';
	import OverseerMessage from 'https://codepen.io/Alca/pen/KwVmEXg.js';

	const props = defineProps({
		settings: {
			type: Object,
			required: true,
		},
		e: {
			type: Object,
			required: true
		},
	});
</script>

<style lang="scss">
</style>