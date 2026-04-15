<script lang="ts">
	let { children, content, forId = '' } = $props();
	let visible = $state(false);

	const show = () => (visible = true);
	const hide = () => (visible = false);

	function handleClick(e: MouseEvent) {
		// If it's linked to an input, manually trigger it only for desktop devices
		const event = e as PointerEvent;
		if (event.pointerType === 'mouse') {
			if (forId) {
				const input = document.getElementById(forId) as HTMLInputElement;
				if (input) input.click();
			}
		}
	}
</script>

<button
	class="tippy-container"
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
	onclick={handleClick}
>
	<div class="trigger">
		{@render children?.()}
	</div>

	{#if visible}
		<div class="tooltip-box">
			{content}
			<div class="arrow"></div>
		</div>
	{/if}
</button>

<style>
	.tippy-container {
		position: relative;
		display: inline-block;
		cursor: help;
		text-decoration: underline dotted;
	}

	.trigger:hover {
		color: #667eea;
		text-decoration: underline;
	}

	.tooltip-box {
		font-weight: 600;
		position: absolute;
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(-50%);

		width: max-content;
		max-width: 150px;
		white-space: normal;
		word-wrap: break-word;
		text-align: center;
		max-width: 50vw;

		background-color: #333;
		color: white;
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 0.85rem;
		z-index: 100;

		animation: scaleIn 0.15s ease-out;
	}

	.arrow {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border-width: 5px;
		border-style: solid;
		border-color: #333 transparent transparent transparent;
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: translateX(-50%) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
	}
</style>
