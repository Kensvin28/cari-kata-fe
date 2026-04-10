<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Cari Kata</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="An advanced searching tool to find Indonesian words and phrases, helpful when playing crosswords (TTS), Wordle or Katla (the Indonesian version), Scrabble, and other word games."
	/>
	<meta property="og:title" content="Cari Kata" />
	<meta
		property="og:description"
		content="An advanced searching tool to find Indonesian words and phrases, helpful when playing crosswords (TTS), Wordle or Katla (the Indonesian version), Scrabble, and other word games."
	/>
	<meta property="og:image" content="https://cari-kata.kensvin28.workers.dev/header.png" />
	<meta property="og:url" content="https://cari-kata.kensvin28.workers.dev" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:locale:alternate" content="en_US" />
</svelte:head>
{@render children()}
