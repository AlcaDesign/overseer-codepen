<template lang="pug">
.message
	template(v-for="(token, i) in tokens" :key="i")
		template(
			v-if="token.type === 'text'"
		) {{ token.text }}
		.emote(
			v-else-if="token.type === 'emote'"
			:title="token.text"
			:style="{ backgroundImage: `url(https://static-cdn.jtvnw.net/emoticons/v2/${token.id}/default/dark/1.0)` }"
			@click.self="$emit('clickEmote', { id: token.id, name: token.text, image: `https://static-cdn.jtvnw.net/emoticons/v2/${token.id}/default/dark/3.0` })"
		)
		.mention(
			v-else-if="token.type === 'mention'"
			:title="`Mention to ${token.recipient}`"
		) {{ token.text }}
		.cheermote(
				v-else-if="token.type === 'cheermote'"
				:title="`${token.text} ${token.value}`"
				:level="token.levelExtended"
			)
			.cheermote-image(
				:style="{ backgroundImage: `url(${token.urlStatic})` }"
				@click.self="$emit('clickEmote', { id: `cheermote:${token.text}:${token.level}`, name: `${token.text} ${token.value}`, image: token.urlAnimated.replace('1.gif', '4.gif') })"
			)
			.cheermote-value {{ token.value.toLocaleString() }}
	.emote.emote-gigantic(
		v-if="rewardType === 'gigantifiedEmote'"
		:title="gigantifiedEmoteText"
		:style="{ backgroundImage: `url(https://static-cdn.jtvnw.net/emoticons/v2/${rewardDetail}/default/dark/2.0)` }"
		@click.self="$emit('clickEmote', { id: rewardDetail, name: gigantifiedEmoteText, image: `https://static-cdn.jtvnw.net/emoticons/v2/${rewardDetail}/default/dark/3.0` })"
	)
</template>

<script setup>
	const props = defineProps({
		cheermotes: {
			type: Map,
			default() {
				const cheermotesDefault = new Map([ 'Cheer', 'DoodleCheer', 'cheerwhal', 'Corgo', 'Scoops',
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
				return cheermotesDefault;
			}
		},
		combineCheermotes: { type: String, default: 'adjacent' },
		text: { type: String, default: '' },
		emotes: { type: Array, default() { return []; } },
		isCheer: { type: Boolean, default: false },
		rewardType: { type: String },
		rewardDetail: { type: String },
		debugLog: { type: Boolean, default: false }
	});
	const log = (...args) => {
		if(props.debugLog) {
			console.log('%c[OMessage]', 'font-weight: bold; color: #09f;', ...args);
		}
	};
	const logGroup = label => {
		if(props.debugLog) {
			console.group(label);
		}
	};
	const logGroupEnd = () => {
		if(props.debugLog) {
			console.groupEnd();
		}
	};
	log(`Input: ${props.text}`);
	const tokens = [];
	const textSplit = Array.from(props.text);
	if(props.emotes.length) {
		logGroup('Working on emotes');
		const emoteParts = props.emotes.flatMap(({ id, indices }) => indices.map(([ start, end ]) => ({ id, start, end })));
		emoteParts.sort((a, b) => a.start - b.start);
		const text = textSplit.slice(0, emoteParts[0].start).join('');
		if(text.length) {
			const token = { type: 'text', text, toString() { return `[text: "${text}"]` } };
			tokens.push(token);
			log(`Text before first emote: ${token}`);
		}
		logGroup('Splitting emotes');
		for(let i = 0; i < emoteParts.length; i++) {
			const { id, start, end } = emoteParts[i];
			const text = textSplit.slice(start, end).join('');
			const token = { type: 'emote', id, text, toString() { return `[emote: "${text}"]`; } };
			tokens.push(token);
			log(`Emote token: ${token}`);
			if(i === emoteParts.length - 1) {
				log('That was the last emote');
				const text = textSplit.slice(end);
				if(text.length) {
					const token = { type: 'text', text: text.join(''), toString() { return `[text: "${text.join('')}"]`; } };
					tokens.push(token);
					log(`Text at the end: ${token}`);
				}
			}
			else {
				const nextEmote = emoteParts[i + 1];
				const text = textSplit.slice(end, nextEmote.start);
				if(text.length) {
					const token = { type: 'text', text: text.join(''), toString() { return `[text: "${text.join('')}"]`; } };
					tokens.push(token);
					log(`Text token between emotes: ${token}`);
				}
			}
		}
		logGroupEnd();
		logGroupEnd();
	}
	else {
		log('No emotes in message');
		tokens.push({ type: 'text', text: props.text, toString() { return `[text: "${props.text}"]` } });
	}
	let gigantifiedEmoteText = '';
	if(props.rewardType === 'gigantifiedEmote') {
		const lastEmoteIndex = tokens.findLastIndex(n => n.type === 'emote' && n.id === props.rewardDetail);
		if(lastEmoteIndex !== -1) {
			log('Removing gigantified emote');
			gigantifiedEmoteText = tokens[lastEmoteIndex].text;
			tokens.splice(lastEmoteIndex, 1);
		}
	}
	for(let i = tokens.length - 1; i >= 0; i--) {
		const token = tokens[i];
		if(token.type !== 'text') {
			continue;
		}
		const newTokens = [];
		const partialText = [];
		for(const word of token.text.split(/ +/g)) {
			const match = /^(['"*([{<\\/]*)(@)((?:[^\u0000-\u007F]|[\w-])+)(?:\b|$)/.exec(word);
			if(!match) {
				partialText.push(word);
				continue;
			}
			if(partialText.length) {
				newTokens.push({ type: 'text', text: `${partialText.join(' ')} ${match[1] || ''}`, toString() { return `[text: "${this.text}"]`; } });
				partialText.splice(0);
			}
			const recipient = match[3];
			newTokens.push({ type: 'mention', text: `@${recipient}`, recipient, toString() { return `[mention: ${this.text}]`; } });
			partialText.push(word.slice(match[0].length));
		}
		if(partialText.length || (partialText.length === 1 && partialText[0] !== '')) {
			newTokens.push({ type: 'text', text: partialText.join(' '), toString() { return `[text: "${this.text}"]`; } });
		}
		tokens.splice(i, 1, ...newTokens);
	}
	if(props.isCheer) {
		logGroup('Message is a cheer');
		log('Combine mode:', props.combineCheermotes);
		const regex = new RegExp(`\\b(${props.cheermotes.keys().toArray().join('|')})([1-9]\\d{0,6})\\b`, 'gi');
		let foundCheermotes = 0;
		for(let i = tokens.length - 1; i >= 0; i--) {
			const token = tokens[i];
			if(token.type !== 'text') {
				log(`Skipping token of type ${token.type}`);
				continue;
			}
			const split = token.text.split(regex);
			if(split.length === 1) {
				log(`Skipping text token with no cheermotes: "${token.text}"`);
				continue;
			}
			logGroup(`Parsing text token: "${token.text}"`);
			const newTokens = [];
			for(let i = 0; i < split.length; i += 3) {
				const [ text, nameText, valueText ] = split.slice(i, i + 3);
				if(text) {
					const token = { type: 'text', text, toString() { return `[text: "${this.text}"]` } };
					log(`Creating text token: ${token}`);
					newTokens.push(token);
				}
				if(nameText) {
					const text = nameText.toLowerCase();
					const value = parseInt(valueText, 10);
					const level = getCheerLevel(value, text);
					const [ urlStatic, urlAnimated ] = getCheermoteImage(text, level);
					const token = {
						type: 'cheermote', text,
						urlStatic, urlAnimated,
						value, level, levelExtended: value >= 100_000 ? 100_000 : level,
						toString() { return `[cheermote: ${this.text}${this.value}${this.value !== value ? ` | init ${text}${value}` : ''}]`; }
					};
					foundCheermotes++;
					log(`Create cheermote token: ${token}`);
					newTokens.push(token);
				}
			}
			logGroupEnd();
			logGroup('Applying cheermotes');
			let globalCheermote;
			tokens.splice(i, 1, ...newTokens.reduceRight((p, n) => {
				const prev = p[0];
				if(!p.length) {
					p.push(n);
				}
				else if(n.type === 'cheermote') {
					switch(props.combineCheermotes) {
						case 'all':
						case 'adjacent': {
							if(prev.type === 'cheermote') {
								n.value += prev.value;
								updateCheermote(n);
								p.splice(0, 1, n);
								log(`Combined two cheermotes into: ${n}`);
							}
							else if(p.length >= 2 && prev.type === 'text' && prev.text.trim() === '' && p[1].type === 'cheermote') {
								n.value += p[1].value;
								updateCheermote(n);
								p.splice(1, 1, n);
								log(`Combined two cheermotes into: ${n}`);
							}
							else {
								log(`Keeping cheermote (${props.combineCheermotes}): ${n}`);
								p.unshift(n);
							}
							break;
						}
						default: {
							log(`Keeping cheermote (${props.combineCheermotes}): ${n}`);
							p.unshift(n);
							break;
						}
					}
				}
				else {
					if(prev.type === 'text') {
						if(n.text.trim() !== '') {
							prev.text = prev.text.trim() !== '' ? prev.text + n.text : n.text;
							log(`Combining text into: ${prev}`);
						}
						else {
							log('Dropping text');
						}
						// else, drop element
					}
					else {
						log(`Keeping text: ${n}`);
						p.unshift(n);
					}
				}
				log(`Progress: ${p.join(' ')}`);
				return p;
			}, []));
			logGroupEnd();
		}
		if(props.combineCheermotes === 'all' && foundCheermotes > 1) {
			logGroup(`Combine all ${foundCheermotes} cheermotes`);
			let lastCheermoteIndex = 0;
			for(let i = tokens.length - 1; i >= 0; i--) {
				const token = tokens[i];
				if(token.type !== 'cheermote') {
					continue;
				}
				if(lastCheermoteIndex) {
					const [ cheermote ] = tokens.splice(lastCheermoteIndex, 1);
					token.value += cheermote.value;
				}
				lastCheermoteIndex = i;
			}
			updateCheermote(tokens[lastCheermoteIndex]);
			logGroupEnd();
		}
		else if(props.combineCheermotes === 'all') {
			log(`Only ${foundCheermotes} cheermotes in message`);
		}
		logGroupEnd();
	}
	log(`Final: ${tokens.join(' ')}`);
	function updateCheermote(c) {
		c.level = getCheerLevel(c.value, c.text);
		c.levelExtended = c.value >= 100_000 ? 100_000 : c.level;
		[ c.urlStatic, c.urlAnimated ] = getCheermoteImage(c.text, c.level);
	}
	function getCheerLevel(bits, name) {
		if(bits >= 100_000 && name === 'cheer') { return 100_000; }
		if(bits >=  10_000) { return  10_000; }
		if(bits >=   5_000) { return   5_000; }
		if(bits >=   1_000) { return   1_000; }
		if(bits >=     100) { return     100; }
		return 1;
	}
	function getCheermoteImage(text, level) {
		const cheermote = props.cheermotes.has(text)
			? props.cheermotes.get(text)
			: props.cheermotes.get('cheer');
		if(!cheermote) {
			return [];
		}
		if(level === 100_000) {
			return cheermote[5] ?? cheermote[4] ?? [];
		}
		return cheermote[{ 1: 0, 100: 1, 1000: 2, 5000: 3, 10000: 4 }[level]] ?? [];
	}
</script>

<style lang="scss">
	.message {
		word-break: break-word;
	}
	.mention {
		display: inline;
		background: hsl(var(--theme-hue, 225), 100%, 60%, 0.3);
		border-radius: 2px;
		padding: 2px 4px;
	}
	.cheermote-image,
	.emote {
		display: inline-block;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		cursor: pointer;
	}
	.cheermote-image {
		width: 28px;
		height: 28px;
		vertical-align: middle;
	}
	.emote {
		width: 28px;
		height: 28px;

		&.emote-gigantic {
			display: block;
			width: 56px;
			height: 56px;
		}
		&:not(.emote-gigantic) {
			vertical-align: middle;
		}
	}
	.cheermote {
		--bits-color: var(--tw-bits-lvl-1-color);
		--bits-weight: 300;
		--bits-font-size: 1em;
		display: inline-flex;
		align-items: center;
		gap: 0.125em;
		vertical-align: middle;

		&[level="1"] {
			--bits-color: var(--tw-bits-lvl-1-color);
			--bits-weight: 350;
		}
		&[level="100"] {
			--bits-color: var(--tw-bits-lvl-100-color);
			--bits-weight: 400;
		}
		&[level="1000"] {
			--bits-color: var(--tw-bits-lvl-1000-color);
			--bits-weight: 500;
			--bits-font-size: 1.05em;
		}
		&[level="5000"] {
			--bits-color: var(--tw-bits-lvl-5000-color);
			--bits-weight: 600;
			--bits-font-size: 1.15em;
		}
		&[level="10000"] {
			--bits-color: var(--tw-bits-lvl-10000-color);
			--bits-weight: 700;
			--bits-font-size: 1.2em;
		}
		&[level="100000"] {
			--bits-color: var(--tw-bits-lvl-100000-color);
			--bits-weight: 900;
			--bits-font-size: 1.25em;
		}
		.cheermote-value {
			color: var(--bits-color);
			font-weight: var(--bits-weight);
			font-size: var(--bits-font-size);
		}
	}
</style>