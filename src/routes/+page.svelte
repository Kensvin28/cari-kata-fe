<script lang="ts">
	import { onMount } from 'svelte';
	import { translations, type Language } from '$lib/i18n/translations';
	import { env } from '$env/dynamic/public';
	import { isValidCharacters, isValidMapping, isValidUnderscoreMapping } from '$lib/utils';
	import { ValidationError } from '$lib/errors';

	// State variables using Svelte 5 runes
	let prefix = $state('');
	let length = $state('');
	let required = $state('');
	let excluded = $state('');
	let fixed = $state('');
	let results = $state<string[]>([]);
	let loading = $state(false);
	let error = $state('');
	const apiUrl = env.PUBLIC_API_BASE_URL;
	let currentLang = $state<Language>('id');
	const t = $derived(translations[currentLang]);
	let isSearched = $state(false);

	// Debounce timer
	// let debounceTimer: ReturnType<typeof setTimeout>;

	function toggleLanguage() {
		currentLang = currentLang === 'en' ? 'id' : 'en';
	}

	function validateInput() {
		// ensure alphabetic characters only
		if (prefix && !isValidCharacters(prefix)) {
			throw new ValidationError(t.errorInvalidCharacters.replace('{input}', t.prefix));
		}

		if (required && !isValidCharacters(required)) {
			throw new ValidationError(t.errorInvalidCharacters.replace('{input}', t.required));
		}

		if (excluded && !isValidCharacters(excluded)) {
			throw new ValidationError(t.errorInvalidCharacters.replace('{input}', t.excluded));
		}

		if (length) {
			const numLength = Number(length);
			if (!Number.isInteger(numLength)) throw new ValidationError(t.errorInvalidNumber);
			if (fixed.length !== numLength) throw new ValidationError(t.errorFixedLengthMismatch);
			if (numLength < 1 || numLength > parseInt(env.PUBLIC_MAX_WORD_LENGTH))
				throw new ValidationError(
					t.errorInvalidLength.replace('{max}', env.PUBLIC_MAX_WORD_LENGTH)
				);
		}

		if (fixed && !(isValidMapping(fixed) || isValidUnderscoreMapping(fixed))) {
			throw new ValidationError(t.errorInvalidMapping.replace('{input}', t.fixed));
		}
	}

	async function searchWords() {
		loading = true;
		error = '';
		try {
			validateInput();
			const params = new URLSearchParams();

			if (prefix) params.append('prefix', prefix);
			if (length) params.append('len', length);
			if (required) params.append('required', required);
			if (excluded) params.append('excluded', excluded);
			if (fixed) params.append('fixed', fixed);
			if (params.size === 0) {
				throw new ValidationError(t.errorEmptyInput);
			}

			const response = await fetch(`${apiUrl}/search?${params.toString()}`);

			if (!response.ok) {
				throw new ValidationError(t.errorFetch);
			}

			results = await response.json();
		} catch (err) {
			error = err instanceof ValidationError ? err.message : t.error;
			results = [];
		} finally {
			loading = false;
			isSearched = true;
		}
	}

	function handleInput() {
		// clearTimeout(debounceTimer);
		// if (isSearched) {
		// 	debounceTimer = setTimeout(() => {
		// 		searchWords();
		// 	}, 5000);
		// }
	}

	function clearFilters() {
		prefix = '';
		length = '';
		required = '';
		excluded = '';
		fixed = '';
		results = [];
		error = '';
	}

	onMount(() => {
		return () => {
			// clearTimeout(debounceTimer);
			isSearched = false;
		};
	});
</script>

<main>
	<div class="container">
		<header>
			<div class="header-content">
				<div>
					<h1>🔍 {t.title}</h1>
					<p class="subtitle">{t.subtitle}</p>
				</div>
				<button
					class="lang-toggle"
					onclick={toggleLanguage}
					title={currentLang === 'en' ? 'Ganti ke bahasa Indonesia' : 'Switch to English'}
				>
					{currentLang === 'en' ? 'ID' : 'EN'}
				</button>
			</div>
		</header>

		<div class="search-panel">
			<div class="form-grid">
				<div class="form-group">
					<label for="prefix">
						{t.prefix}
						<span class="hint">{t.prefixHint}</span>
					</label>
					<input
						id="prefix"
						type="text"
						bind:value={prefix}
						oninput={handleInput}
						placeholder={t.prefixPlaceholder}
					/>
				</div>

				<div class="form-group">
					<label for="length">
						{t.length}
						<span class="hint">{t.lengthHint}</span>
					</label>
					<input
						id="length"
						type="number"
						bind:value={length}
						oninput={handleInput}
						placeholder={t.lengthPlaceholder}
						min="1"
						max={env.PUBLIC_MAX_WORD_LENGTH}
					/>
				</div>

				<div class="form-group">
					<label for="required">
						{t.required}
						<span class="hint">{t.requiredHint}</span>
					</label>
					<input
						id="required"
						type="text"
						bind:value={required}
						oninput={handleInput}
						placeholder={t.requiredPlaceholder}
					/>
				</div>

				<div class="form-group">
					<label for="excluded">
						{t.excluded}
						<span class="hint">{t.excludedHint}</span>
					</label>
					<input
						id="excluded"
						type="text"
						bind:value={excluded}
						oninput={handleInput}
						placeholder={t.excludedPlaceholder}
					/>
				</div>

				<div class="form-group full-width">
					<label for="fixed">
						{t.fixed}
						<span class="hint">{t.fixedHint}</span>
					</label>
					<input
						id="fixed"
						type="text"
						bind:value={fixed}
						oninput={handleInput}
						placeholder={t.fixedPlaceholder}
					/>
				</div>
			</div>

			<div class="actions">
				<button class="btn btn-primary" onclick={searchWords} disabled={loading}>
					{loading ? t.searching : t.search}
				</button>
				<button class="btn btn-secondary" onclick={clearFilters}> {t.clearAll} </button>
			</div>
		</div>

		{#if error}
			<div class="error-message">
				⚠️ {error}
			</div>
		{/if}

		<div class="results-panel">
			<div class="results-header">
				<h2>{t.results}</h2>
				{#if isSearched && !loading}
					<span class="count">{results.length} {t.wordsFound}</span>
				{/if}
			</div>

			{#if loading}
				<div class="loading">
					<div class="spinner"></div>
					<p>{t.searchingWords}</p>
				</div>
			{:else if results.length > 0}
				<div class="results-grid">
					{#each results as word}
						<a
							href={`https://kbbi.kemendikdasmen.go.id/entri/${encodeURIComponent(word)}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div class="word-card">{word}</div>
						</a>
					{/each}
				</div>
			{:else if results.length === 0 && isSearched}
				<div class="empty-state">
					<p>{t.noWordsFound}</p>
				</div>
			{:else if !error}
				<div class="empty-state">
					<p>{t.enterCriteria}</p>
				</div>
			{/if}
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	main {
		padding: 2rem 1rem;
		min-height: 100vh;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
	}

	header {
		color: white;
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	h1 {
		margin: 0;
		font-size: 3rem;
		font-weight: 700;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		margin: 0.5rem 0.5rem 0;
		font-size: 1.1rem;
		opacity: 0.95;
	}

	.lang-toggle {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		white-space: nowrap;
	}

	.lang-toggle:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}

	.search-panel {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		margin-bottom: 2rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	label {
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.hint {
		font-size: 0.75rem;
		font-weight: 400;
		color: #666;
	}

	input {
		padding: 0.75rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn {
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #333;
	}

	.btn-secondary:hover {
		background: #e0e0e0;
	}

	.error-message {
		background: #fee;
		color: #c33;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.results-panel {
		background: white;
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		min-height: 200px;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.results-header h2 {
		margin: 0;
		color: #333;
		font-weight: 600;
	}

	.count {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #666;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid #f0f0f0;
		border-top-color: #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}

	.word-card {
		background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 600;
		color: #333;
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.word-card:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #999;
		font-size: 1.1rem;
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
		}

		.search-panel,
		.results-panel {
			padding: 1.5rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}

		.results-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
</style>
